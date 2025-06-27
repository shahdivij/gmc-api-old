const express = require('express')
const { verifyOTP, checkToken, verifyToken, getAccessToken, verifyAccessToken } = require('../../../../utility/common_api_functions')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post("/", checkToken, async (req, res) => {
    const mobileNumber = req.body.mobile_number
    const otp = req.body.otp
    let token = req.token
    const decodedToken = await verifyAccessToken(token)

    if(decodedToken.mobile_number != mobileNumber){
        return res.status(409).json({
            success: false,
            statusCode: 409,
            msg: "Invalid Token",
            errors: [{
                "type": "field",
                "value": token,
                "msg": "Invalid Token",
                "path": "Authorization",
                "location": "Headers"
            }]
        })
    } else {
        try {
            const data = await verifyOTP(otp, mobileNumber)

            if(data.type == 'success'){
                const newToken = await getAccessToken({verified: true, ...decodedToken}) 
                return res.status(200).json({
                    success: true,
                    statusCode: 200,
                    msg: "OPT verified successfully for " + mobileNumber,
                    data: [{
                        mobile_number: mobileNumber,
                        token: newToken
                    }]
                }) 
            }
            
            if(data.type == 'error'){
                // could not verify OTP
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
            console.log(error)
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
    }


})

module.exports = router