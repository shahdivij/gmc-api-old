const express = require('express')
const { STATUS_CODE, getStatusString } = require('./../../../utility/status')
const { body, matchedData, validationResult } = require('express-validator')
const { getAccessToken, verifyAccessToken } = require('../../../utility/common_api_functions')
const router = express.Router()
const Razorpay = require('razorpay')
const Customer = require('../../../models/customer/customer.model')
const env = process.env

const bodyValidators = () => {
    return [
        body('data_token').trim().custom(async value => {
            if(!value) throw new Error("Data Token is required.")
            const verified = await verifyAccessToken(value)  
            delete verified['iat']
            console.log(verified)
            if(!verified) throw new Error("Invalid data token is passed.")
            if(!(verified.first_car_price && verified.total_payable && verified.net_price && verified.net_payable && verified.customer && verified.car && verified.package)) {
                throw new Error("Data token is missing values.")
            }
        })
    ]
}

const validateBody = async (req, res, next) => {
    console.log(req.body)
    const result = validationResult(req)
    console.log(result.array())
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }  

    next()
}

router.post("/", bodyValidators(), validateBody, async (req, res) => {
    const matchedBodyData = matchedData(req)
    try {
        const verified = await verifyAccessToken(matchedBodyData.data_token)
        const razorpay = new Razorpay({
            key_id: env.RAZORPAY_KEY,
            key_secret: env.RAZORPAY_SECRET,
        })

        var options = {
            amount: parseFloat(verified.total_payable) * 100,  
            currency: "INR",
            receipt: verified.car,
            notes: {
                customer: verified.customer,
                car: verified.car,
                package: verified.package,
            }
        };
        const customerData = await Customer.find({_id: verified.customer})
       
        razorpay.orders.create(options, async function(err, order) {
            console.log(err)
            if(err){
                return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                    msg: err,
                    statusCode: STATUS_CODE.INTERNAL_ERROR,
                    success: false,
                    errors: []
                })
            }

            const token = await getAccessToken({
                ...verified,
                order_id: order.id,
            })

            return res.status(STATUS_CODE.OK).json({
                msg: getStatusString(STATUS_CODE.OK),
                statusCode: STATUS_CODE.OK,
                success: true,
                data: [{
                    order_id: order.id,
                    amount: parseFloat(verified.total_payable) * 100,
                    currency: "INR",
                    customer: {
                        name: customerData[0].name,
                        mobile_number: customerData[0].mobile_number,
                        email: customerData[0].email || null
                    },
                    data_token: token
                }]
            })
        })
        
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
})

module.exports = router