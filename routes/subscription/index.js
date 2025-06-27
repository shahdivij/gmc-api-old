const express = require('express')
const router = express.Router()
const CONSTANT = require('./../../utility/constants')
const { STATUS_CODE, getStatusString } = require('./../../utility/status')
const { bodyValidators } = require('./validators')
const Subscription = require('./../../models/subscription/subscription.model')
const { validationResult, matchedData } = require('express-validator')
const { default: mongoose } = require('mongoose')
const { getNextSequence, createSchedule, verifyAccessToken } = require('./../../utility/common_api_functions')
const Package = require('../../models/package/package.model')
const CustomerCar = require('../../models/customer_car')
const NationalHoliday = require('./../../models/holiday/nationalholiday.model')
const LocalHoliday = require('./../../models/holiday/localholiday.model')
const Cluster = require('../../models/cluster/cluster.model')
const { DateTime } = require("luxon")
const Schedule = require('../../models/schedule/schedule.model')
const Customer = require('../../models/customer/customer.model')
const QRCodeSeries = require('../../models/qrcodeseries/qrcodeseries.model')
const QRCode = require('../../models/qrcode/qrcode.model')
const Transaction = require('../../models/transaction/transaction.model')
const Razorpay = require('razorpay')
const env = process.env


router.get("/", async (req, res) => {
    try {
        const data = await Subscription.find().populate('customer').populate('cluster').populate('car').exec()
        
        return res.status(STATUS_CODE.OK).json({
            msg: 'Subscription data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
}).post("/", bodyValidators(), async (req, res) => {
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }
    
    const session = await mongoose.startSession()
    try {
        const matchedBodyData = matchedData(req)
        session.startTransaction()

        const verified = await verifyAccessToken(matchedBodyData.data_token)

        const subscription_id = await getNextSequence(CONSTANT.MODEL.SUBSCRIPTION, session)

        const packageData = await Package.find({_id: verified.package})
        
        const number_of_days = packageData[0].number_of_days
        const interior_cleaning = packageData[0].interior_cleaning
        const exterior_cleaning = packageData[0].exterior_cleaning
        // create schedule for this subscription
        let startDate = DateTime.now().plus({days: 1}).toISODate()
        let endDate = DateTime.now().plus({days: number_of_days}).toISODate()
        
        const carData = await CustomerCar.find({_id: verified.car}).populate({
            path: 'model',
            populate: ['category']
        }).populate({
            path: 'subscription',
            populate: ['schedule']
        }).exec()

        const priceData = packageData[0].prices.filter(priceObject => priceObject.category.equals(carData[0].model.category._id))

        const clusterData = await Cluster.find({_id: matchedBodyData.cluster})

        const runningSubscription = carData[0].subscription.find(sub => sub.active_status == "Active") 

        const newSubscription = new Subscription({
            subscription_id: subscription_id,
            package: {
                _id: matchedBodyData.package, 
                package_id: packageData[0].package_id,
                package_name: packageData[0].name
            },
            start_date: startDate,
            end_date: endDate,
            customer: matchedBodyData.customer,
            cluster: matchedBodyData.cluster,
            car: matchedBodyData.car,
            price: priceData[0].actual_price,
            interior_cleaning: packageData[0].interior_cleaning,
            exterior_cleaning: packageData[0].exterior_cleaning,
            number_of_days: packageData[0].number_of_days,
            active_status: runningSubscription && Object.keys(runningSubscription) && Object.keys(runningSubscription).length ? "Upcoming" : "Active"
        })
        
        const  savedSubscription = await newSubscription.save({session: session})

        console.log('savedSubscription --> ', savedSubscription)

        // creating a transaction record and save
        const transaction_id = await getNextSequence(CONSTANT.MODEL.TRANSACTION, session)

        const razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY,
            key_secret: env.RAZORPAY_SECRET,
        })

        const paymentDetails = await razorpay.payments.fetch(verified.payment_id)

        console.log('paymentDetails --> ', paymentDetails)

        const transaction = new Transaction({
            transaction_id,
            payment_id: verified.payment_id,
            order_id: verified.order_id,
            amount: verified.total_payable,
            paid_by: verified.customer,
            subscription_id: savedSubscription._id, 
            method: paymentDetails && paymentDetails.method || '-'
        })

        const saved = await transaction.save({session: session})

        
        const _31DaysMonths = ["01", "03", "05", "07", "08", "10", "12"]
        if(runningSubscription){
            startDate = DateTime.fromJSDate(runningSubscription.schedule.end_date).plus({days: 1}).toISODate()
            endDate = DateTime.fromISO(startDate).plus({days: number_of_days}).toISODate()
            const monthNumber = startDate.toString().split("-")[1]
            if(_31DaysMonths.includes(monthNumber)){
                endDate = DateTime.fromISO(startDate).plus({days: number_of_days - 1}).toISODate()
            }
        }

        const national_holidays = await NationalHoliday.find({date: {$lte: endDate, $gte: startDate}}, 'date')
        const local_holidaysData = await LocalHoliday.find({city: clusterData[0].address.city, 'holidays.date': {$lte: endDate, $gte: startDate}})
        
        let local_holidays = []
        // local_holidays = local_holidaysData[0].holidays.forEach(holiday => DateTime.fromJSDate(holiday.date).toISODate() <= endDate && DateTime.fromJSDate(holiday.date).toISODate() >= startDate)
        local_holidays = local_holidaysData && local_holidaysData.length && local_holidaysData[0].holidays.filter(holiday => DateTime.fromJSDate(holiday.date).toISODate().valueOf() <= endDate.valueOf() && DateTime.fromJSDate(holiday.date).toISODate().valueOf() >= startDate.valueOf())

        const off_days = clusterData[0].off_days

        const scheduleData = createSchedule({
            startDate: startDate,
            endDate: endDate,
            number_of_days: number_of_days,
            exterior_cleaning: exterior_cleaning,
            interior_cleaning: interior_cleaning,
            national_holidays: national_holidays.map(holiday => DateTime.fromJSDate(holiday.date).toISODate()),
            local_holidays: (local_holidays && local_holidays.length && local_holidays.map(holiday => DateTime.fromJSDate(holiday.date).toISODate())) || [],
            off_days: off_days
        })

        const schedule_id = await getNextSequence(CONSTANT.MODEL.SCHEDULE, session)

        const newSchedule = new Schedule({
            schedule_id: schedule_id,
            dates: scheduleData,
            subscription: savedSubscription._id,
            start_date: startDate,
            end_date: endDate,
        })

        const savedSchedule = await newSchedule.save({session: session})

        await Subscription.findByIdAndUpdate(savedSubscription._id, {schedule: savedSchedule._id}).session(session)

        if(carData && carData.length && carData[0].qr_code && carData[0].qr_code && carData[0].qr_code.qr_code_id != null){
            await CustomerCar.findByIdAndUpdate(matchedBodyData.car, {parking_lot_number: matchedBodyData.parking_lot_number , house_flat_no: matchedBodyData.house_flat_number}).session(session)
        } else if(carData && carData.length > 0 && carData[0].qr_code.qr_code_id == null) {
            const qrcodeseries = await QRCodeSeries.find({_id: clusterData[0].qr_code_series})
            const qrCodesData = qrcodeseries[0].qr_codes
            const generatedRange = qrcodeseries[0].generated_range
            let nextToAssign = qrcodeseries[0].next_to_assign
            if(!nextToAssign){
                nextToAssign = qrcodeseries[0].name + "_" + (qrcodeseries[0].range.trim().split("-")[0])
            }
            const a = nextToAssign.toString().split("_")
            const number = a[a.length - 1]
            const qrCode = await QRCode.find({qr_code_id: nextToAssign})
            const newNextToAssign = qrcodeseries[0].name + "_" + (parseInt(number) + 1)
            const qrCodeData = {
                qr_code_id: qrCode[0].qr_code_id,
                series_id: qrCode[0].series_id,
                data: {
                    image_data: qrCode[0].data.image_data || null,
                    generated_at: qrCode[0].data.generated_at || null
                }
            }
            await CustomerCar.findByIdAndUpdate(matchedBodyData.car, {parking_lot_number: matchedBodyData.parking_lot_number , house_flat_no: matchedBodyData.house_flat_number, qr_code: qrCodeData}).session(session)
            await QRCodeSeries.findByIdAndUpdate(qrcodeseries[0]._id, { is_in_use: true, next_to_assign: newNextToAssign }).session(session)
            await QRCode.findOneAndUpdate({qr_code_id: nextToAssign}, {is_active: true, assigned_to:  matchedBodyData.customer}).session(session)
        }


        // Update subscription ID in customer car
        const updatedCar = await CustomerCar.findByIdAndUpdate(matchedBodyData.car, {$push: {subscription: [savedSubscription._id]}}, {new: true}).session(session)

        if(carData && carData.length > 0){
            if(carData[0].cleaning_balance.look_up_date == null){
                await CustomerCar.findByIdAndUpdate(carData[0]._id, {"cleaning_balance.look_up_date": startDate}).session(session)
            } else {
                await CustomerCar.findByIdAndUpdate(carData[0]._id, {"cleaning_balance.look_up_date": verified.look_up_date}).session(session)
            }
        }

        for(let key in verified.schedule_and_adjusted_cleanings){
            const datesData = verified.schedule_and_adjusted_cleanings[key]
            const ids = datesData.map(dateData => dateData._id)
            const schedule = await Schedule.findById(key)
            schedule.dates = schedule.dates.map(date => {
                if(ids.includes(date._id.toString())){
                    return {
                        ...date,
                        status: "COMPLETE"
                    }
                } else {
                    return {
                        ...date
                    }
                }
            })
            await schedule.save({session: session})
        }
    
        await Customer.findByIdAndUpdate(matchedBodyData.customer, {first_subscription_taken: true}).session(session)

        session.commitTransaction()
        // session.abortTransaction()

        return res.status(STATUS_CODE.OK).json({
            msg: getStatusString(STATUS_CODE.OK),
            statusCode: STATUS_CODE.OK,
            success: true,
            data: [{}]
        })

    } catch (error) {
        console.log(error)
        session.abortTransaction()
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
}).put("/:id", async (req, res) => {

}).delete("/:id", async (req, res) => {
    
})

module.exports = router