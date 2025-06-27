const express = require('express')
const { checkToken, getAccessToken, verifyAccessToken, getRefreshToken } = require('../../../utility/common_api_functions')
const Customer = require('../../../models/customer/customer.model')
const { DateTime } = require('luxon')
const { default: mongoose } = require('mongoose')
const RefreshToken = require('../../../models/refresh_token/refresh_token.model')

const router = express.Router()

router.post("/", checkToken, async (req, res) => {
    const mobileNumber = req.body.mobile_number
    const token = req.token
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const decodedToken = await verifyAccessToken(token)
    
        if(decodedToken.action == "LOGIN" && decodedToken.verified && mobileNumber == decodedToken.mobile_number){
            const customer = await Customer.find({mobile_number: mobileNumber})
            console.log(customer)
            if(customer.length <= 0) {
                session.abortTransaction()
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    msg: "Mobile number is not registered.",
                    errors: [{
                        "type": "field",
                        "value": mobileNumber,
                        "msg": "Mobile number is not registered.",
                        "path": "mobile_number",
                        "location": "body"
                    }]
                }) 
            }
            const accessToken = await getAccessToken({_id: customer._id, customer_id: customer.customer_id, mobile_number: customer.mobile_number}, { expiresIn: '1m' })        
            const refreshToken = await getRefreshToken({_id: customer._id, customer_id: customer.customer_id, mobile_number: customer.mobile_number}, { expiresIn: '30d' })


            const refreshTokenDB = new RefreshToken({
                token: refreshToken,
                expires_in: DateTime.now().plus({days: 30})
            })

            await refreshTokenDB.save(session)

            session.commitTransaction()

            return res.status(200).json({
                success: true,
                statusCode: 200,
                msg: "Login successful.",
                data: [{
                    customer: customer,
                    access_token: accessToken,
                    refresh_token: refreshToken
                }]
            }) 
        }
    
        session.abortTransaction()
        return res.status(409).json({
            success: false,
            statusCode: 409,
            msg: "Invalid Token passed.",
            errors: [{
                "type": "field",
                "value": token,
                "msg": "Invalid Token passed.",
                "path": "Authorization",
                "location": "Headers"
            }]
        }) 
        
    } catch (error) {
        console.log(error)
        session.abortTransaction()
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