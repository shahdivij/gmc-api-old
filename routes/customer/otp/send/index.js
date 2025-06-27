const express = require('express')
const { sendOTP, getAccessToken, checkMobilenumberExist } = require('../../../../utility/common_api_functions')
const Customer = require('../../../../models/customer/customer.model')

const router = express.Router()

router.post("/", async (req, res) => {
    const mobileNumber = req.body.mobile_number
    const action = req.body.action
    let token = null


    const userExists = await checkMobilenumberExist(mobileNumber, Customer)
    if(action === "LOGIN"){
        if(!userExists){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "This mobile number is not registered.",
                errors: [{
                    value: mobileNumber,
                    msg: "This mobile number is not registered.",
                    path: "mobile_number",
                    location: "body",
                    type: "field"
                }]
            }) 
        }
        token = await getAccessToken({mobile_number: mobileNumber, action: 'LOGIN'})    

    }

    if(action === "SIGNUP"){
        if(userExists){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "This mobile number is already registered.",
                errors: [{
                    value: mobileNumber,
                    msg: "This mobile number is already registered.",
                    path: "mobile_number",
                    location: "body",
                    type: "field"
                }]
            }) 
        }
        token = await getAccessToken({mobile_number: mobileNumber, action: 'SIGNUP'})    
    }

    try {
        if(token == null) {
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Invalid Action passed.",
                errors: [{
                    value: action,
                    msg: "Invalid Action passed.",
                    path: "action",
                    location: "body",
                    type: "field"
                }]
            })
        }
        const data = await sendOTP(mobileNumber)

        if(data.type == 'success'){
            // resent OTP
            return res.status(200).json({
                success: true,
                statusCode: 200,
                msg: "OPT sent to " + mobileNumber,
                data: [{
                    mobile_number: mobileNumber,
                    token
                }]
            }) 
        }
        
        if(data.type == 'error'){
            // could not resend OTP
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: data.message,
                errors: [{
                    value: mobileNumber,
                    msg: data.message,
                    path: "mobile_number",
                    location: "body",
                    type: "field"
                }]
            }) 
        }
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        }) 
    }

})

module.exports = router