const express = require('express')
const { resendOTP } = require('../../../../utility/common_api_functions')

const router = express.Router()

router.post("/", async (req, res) => {
    const mobileNumber = req.body.mobile_number
    
    try {
        const data = await resendOTP(mobileNumber)
        if(data.type == 'success'){
            // resent OTP
            return res.status(200).json({
                success: true,
                statusCode: 200,
                msg: "OPT resent to " + mobileNumber,
                data: [{
                    mobile_number: mobileNumber
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