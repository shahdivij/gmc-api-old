const express = require('express')
const { STATUS_CODE, getStatusString } = require('./../../../utility/status')
const { body, matchedData, validationResult } = require('express-validator')
const { verifyToken, getAccessToken, verifyAccessToken } = require('../../../utility/common_api_functions')
const env = process.env
var { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils')


const router = express.Router()

const bodyValidators = () => {
    return[
        body("razorpay_payment_id").trim().notEmpty().withMessage("razorpay_payment_id is required."),
        body("razorpay_order_id").trim().notEmpty().withMessage("razorpay_order_id is required."),
        body("razorpay_signature").trim().notEmpty().withMessage("razorpay_signature is required."),
        body("data_token").trim().notEmpty().withMessage("data_token is required."),
    ]
}

const validateBody = async (req, res, next) => {
    const result = validationResult(req)
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
    try {
        const matchedBodyData = matchedData(req)
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, data_token } = matchedBodyData
        const verifiedToken = await verifyAccessToken(data_token)
        if(!verifiedToken){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    msg: "Invalid data token",
                    param: "data_token",
                    location: "body",
                    type: "field",
                    value: data_token
                }]
            })
        }

        const signatureVerified = await validatePaymentVerification({"order_id": verifiedToken.order_id, "payment_id": razorpay_payment_id }, razorpay_signature, env.RAZORPAY_SECRET)
        
        if(!signatureVerified){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    msg: "Invalid payment signature",
                    param: "razorpay_signature",
                    location: "body",
                    type: "field",
                    value: razorpay_signature
                }]
            })
        }

        const newDataToken = await getAccessToken({...verifiedToken, "payment_id": razorpay_payment_id})

        return res.status(STATUS_CODE.OK).json({
            msg: getStatusString(STATUS_CODE.OK),
            statusCode: STATUS_CODE.OK,
            success: true,
            data: [{
                ...matchedBodyData,
                data_token: newDataToken
            }]
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