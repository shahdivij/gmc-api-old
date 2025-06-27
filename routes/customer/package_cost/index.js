const express = require("express")
const { body, validationResult, matchedData } = require("express-validator")
const { isValidObjectId, getAccessToken } = require("../../../utility/common_api_functions")
const Customer = require("../../../models/customer/customer.model")
const Package = require("../../../models/package/package.model")
const { STATUS_CODE, getStatusString } = require('./../../../utility/status')
const Subscription = require("../../../models/subscription/subscription.model")
const { DateTime } = require("luxon")
const Schedule = require("../../../models/schedule/schedule.model")
const CustomerCar = require("../../../models/customer_car")
const Discount = require("../../../models/discount/discount.model")

const router = express.Router()

const bodyValidators = () => {
    return [
        body("customer").trim().custom(async value => {
            if(!value) throw new Error("Customer ID is required.")
            
            if(!isValidObjectId(value)) throw new Error("Invalid Customer ID.")

            const exists = await Customer.exists({_id: value})
            if(!exists) throw new Error("Customer does not exist with given ID.")
        }),
        body("package").trim().custom(async value => {
            if(!value) throw new Error("Package ID is required.")
            
            if(!isValidObjectId(value)) throw new Error("Invalid Package ID.")

            const exists = await Package.exists({_id: value})
            if(!exists) throw new Error("Package does not exist with given ID.")
        }),
        body("car").trim().custom(async value => {
            if(!value) throw new Error("Car ID is required.")
            
            if(!isValidObjectId(value)) throw new Error("Invalid Car ID.")

            const exists = await CustomerCar.exists({_id: value})
            if(!exists) throw new Error("Car does not exist with given ID.")
        }),
        body("discount_coupon_code").trim().optional()
    ]
}

router.post("/", bodyValidators(), async(req, res) => {
    const result = validationResult(req)
    
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }    
    try {
        const bodyData = matchedData(req)

        let discountData = null
        if(bodyData && bodyData.discount_coupon_code){
            discountData = await Discount.find({discount_code: bodyData.discount_coupon_code, service: 'Hire Car Cleaner'})
        }

        const packageData = await Package.find({_id: bodyData.package})
        if(!packageData) throw new Error("Package does not exist with given ID.")

        const customerData = await Customer.find({_id: bodyData.customer})
        if(!customerData) throw new Error("Customer does not exist with given ID.")

        const carData = await CustomerCar.find({_id: bodyData.car}, 'model').populate("model").exec()
        // console.log(carData)
        const carCategory = carData[0].model.category

        let categoryPriceData = packageData[0].prices.filter(price => price.category.equals(carCategory))
        if(categoryPriceData && categoryPriceData.length > 0){
            categoryPriceData = categoryPriceData[0]
        } else {
            categoryPriceData = null
        }  
        
        const look_up_date = carData[0].cleaning_balance.look_up_date || DateTime.now().toISODate()
        
        const allSubscriptionData = await Subscription.find({car: carData[0]._id})
       

        const neededSubscriptionData = allSubscriptionData.filter(item => {
            if(item.cleaning_balance_report && item.cleaning_balance_report.length > 0){
                return item.cleaning_balance_report.any(item => item.all_settled == false)
            } else {
                return true
            }
        })

        const scheduleIdArray = []
        if(neededSubscriptionData.length > 0){
            neededSubscriptionData.forEach(subscription => {
                scheduleIdArray.push(subscription.schedule)
            })
        }
        
        const currentDate = DateTime.now().plus({days: 0}).toISODate()
        // const currentDate = DateTime.now().toISODate()
    

        const scheduleData = await Schedule.find().where({_id: {$in: scheduleIdArray}})

        let changesForSchedule = {}
       
        let incompleteCleanings = []
        scheduleData.forEach(schedule => {
            if(DateTime.fromJSDate(schedule.end_date).toISODate() >= look_up_date && DateTime.fromJSDate(schedule.start_date).toISODate() >= look_up_date){
                changesForSchedule[schedule._id] = [...schedule.dates.filter(date => date.day_type == "WORKING_DAY" && date.status == "INCOMPLETE" && DateTime.fromJSDate(date.date).toISODate() <= currentDate)]
                incompleteCleanings.push(...schedule.dates.filter(date => date.day_type == "WORKING_DAY" && date.status == "INCOMPLETE" && DateTime.fromJSDate(date.date).toISODate() <= currentDate))
            }
        })

        const sortedIncompleteCleanings = incompleteCleanings.sort((itemA, itemB) => DateTime.fromJSDate(itemB.date).toISODate() > DateTime.fromJSDate(itemA.date).toISODate() ? -1 : 1)
        incompleteCleanings = sortedIncompleteCleanings
        
        let sortedChangesForSchedule = {}
        Object.keys(changesForSchedule).forEach(key => {
            const sorted = changesForSchedule[key].sort((itemA, itemB) => DateTime.fromJSDate(itemB.date).toISODate() > DateTime.fromJSDate(itemA.date).toISODate() ? -1 : 1)
            sortedChangesForSchedule[key] = sorted
        })
        changesForSchedule = sortedChangesForSchedule

        const cost_per_internal_cleaning = 50
        const cost_per_external_cleaning = 30
        
        let package_cost = categoryPriceData.actual_price
        let secondCarDiscount = false
        if(customerData[0].first_subscription_taken && customerData[0].cars.length >= 2 && packageData[0]._2nd_car_onward_off > 0){
            secondCarDiscount = true
        }
        let total_adjustable_amount = 0
        let keep_looking = true
        let new_look_up_date = null

        let adjustedCleanings = []

        if(incompleteCleanings && incompleteCleanings.length > 0){
            incompleteCleanings.forEach(cleaning => {
                if(keep_looking){
                    if(keep_looking && cleaning.cleaning_type == "INTERIOR"){
                        if(total_adjustable_amount + cost_per_internal_cleaning >= package_cost){
                            keep_looking = false
                            new_look_up_date = DateTime.fromJSDate(cleaning.date).toISODate()
                        } else {
                            adjustedCleanings.push(cleaning)
                            total_adjustable_amount += cost_per_internal_cleaning
                        }
                    } 
                    
                    if(keep_looking && cleaning.cleaning_type == "EXTERIOR"){
                        if(total_adjustable_amount + cost_per_external_cleaning >= package_cost){
                            keep_looking = false
                            new_look_up_date = DateTime.fromJSDate(cleaning.date).toISODate()
                        } else {
                            adjustedCleanings.push(cleaning)
                            total_adjustable_amount += cost_per_external_cleaning
                        }
                    } 
    
                }
            })
        }

        let tax_amount = 0
        packageData[0].taxes.forEach(tax => {
            const tax_amount_ = package_cost * (tax.value / 100)
            tax_amount += tax_amount_
        })

        let scheduleAndAdjustedCleanings = {}
        Object.keys(changesForSchedule).forEach(key => {
            const neededOnly = changesForSchedule[key].filter(date => adjustedCleanings.includes(date))
            scheduleAndAdjustedCleanings[key] = neededOnly
        })

        
        const first_car_price = categoryPriceData.actual_price
        const second_car_onward_discount = secondCarDiscount ? (((categoryPriceData.actual_price * packageData[0]._2nd_car_onward_off / 100) - (categoryPriceData.actual_price * packageData[0]._2nd_car_onward_off / 100) % 10)) : 0
        const net_price = first_car_price - second_car_onward_discount
        const cleaning_balance_adjustment = total_adjustable_amount || 0
        const taxes = packageData[0].taxes || []
        const applicable_for_discount_coupon = cleaning_balance_adjustment > 0 ? false : true
        const total_tax_amount = tax_amount || 0
        
        let discountPrice = 0
        if(discountData && discountData.length){
            if(discountData[0].discount_percent > 0){
                const value = net_price * (discountData[0].discount_percent / 100)
                if(value > discountData[0].discount_upto_amount){
                    discountPrice = discountData[0].discount_upto_amount
                }
            } else if (discountData[0].discount_amount > 0){
                discountPrice = discountData[0].discount_amount
            } 
        }
        
        const coupon_discount = applicable_for_discount_coupon ? discountPrice : 0
        const net_payable = (net_price - cleaning_balance_adjustment - coupon_discount)
        const total_payable = net_payable + total_tax_amount 
        const applied_discount_coupon_code = applicable_for_discount_coupon ? discountData && discountData.length && discountData[0].discount_code || null : null
        
        const dataToSend = {
            look_up_date: new_look_up_date || null,
            schedule_and_adjusted_cleanings: scheduleAndAdjustedCleanings || [],
            first_car_price,
            second_car_onward_discount,
            net_price,
            cleaning_balance_adjustment,
            taxes,
            total_tax_amount,
            coupon_discount,
            net_payable,
            total_payable,
            customer: customerData[0]._id,
            car: carData[0]._id,
            package: packageData[0]._id,
            applicable_for_discount_coupon,
            applied_discount_coupon_code,
        }

        const encryptedData = await getAccessToken(dataToSend)

        return res.status(STATUS_CODE.OK).json({
            msg: "Package Cost",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: {
                first_car_price,
                second_car_onward_discount,
                net_price,
                cleaning_balance_adjustment,
                taxes,
                total_tax_amount,
                coupon_discount,
                net_payable,
                total_payable,
                applicable_for_discount_coupon,
                applied_discount_coupon_code,
                data_token: encryptedData,
            }
        })
        // return res.status(STATUS_CODE.OK).json({
        //     msg: "Package Cost",
        //     statusCode: STATUS_CODE.OK,
        //     success: true,
        //     data: {
        //         package_strikethrough_cost: secondCarDiscount ? categoryPriceData.actual_price : categoryPriceData.strikethrough_price,
        //         package_actual_cost: package_cost,
        //         total_adjustable_amount: total_adjustable_amount || 0,
        //         taxes: packageData[0].taxes,
        //         total_amount: tax_amount + package_cost,
        //         total_amount_to_pay: (package_cost - (total_adjustable_amount || 0)) + tax_amount,
        //         data_token: encryptedData,
        //         second_car_onward_discount: secondCarDiscount ? {
        //             discount_amount: (categoryPriceData.actual_price * packageData[0]._2nd_car_onward_off / 100),
        //             effective_amount: categoryPriceData.actual_price - (categoryPriceData.actual_price * packageData[0]._2nd_car_onward_off / 100),
        //         } : null,
        //     }
        // })


    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
})

module.exports = router