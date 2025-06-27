const express = require('express')
const {
    getNextSequence,
    checkToken,
    getAccessToken,
    verifyAccessToken,
    getRefreshToken
} = require('../../../utility/common_api_functions')
const Customer = require('../../../models/customer/customer.model')
const router = express.Router()
const CONSTANT = require('./../../../utility/constants')
const { DateTime } = require('luxon')
const { default: mongoose } = require('mongoose')
const RefreshToken = require('../../../models/refresh_token/refresh_token.model')

router.post('/', checkToken, async (req, res) => {
    const mobile_number = req.body.mobile_number
    const name = req.body.name
    
    const token = req.token
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const decodedToken = await verifyAccessToken(token)
        if(decodedToken.action == "SIGNUP" && decodedToken.verified && mobile_number == decodedToken.mobile_number){
            
            const exists = await Customer.exists({mobile_number: mobile_number})
            
            if(exists){
                return res.status(409).json({
                    success: false,
                    statusCode: 409,
                    msg: "This mobile number is already registered.",
                    errors: [{
                        "type": "field",
                        "value": mobile_number,
                        "msg": "This mobile number is already registered.",
                        "path": "mobile_number",
                        "location": "body"
                    }]
                })
            }

            const customerID = await getNextSequence(CONSTANT.MODEL.CUSTOMER, session)
            const customer = new Customer({
                name,
                mobile_number,
                role: CONSTANT.ROLE.CUSTOMER,
                customer_id: customerID
            })

            const saved = await customer.save().session(session)
            const accessToken = await getAccessToken({_id: saved._id, customer_id: customer.customer_id, mobile_number: customer.mobile_number}, { expiresIn: '1h' })        
            const refreshToken = await getRefreshToken({_id: saved._id, customer_id: customer.customer_id, mobile_number: customer.mobile_number}, { expiresIn: '30d' })        
                        
            const refreshTokenDB = new RefreshToken({
                token: refreshToken,
                expires_in: DateTime.now().plus({days: 30})
            })

            await refreshTokenDB.save().session(session)

            session.commitTransaction()

            return res.status(200).json({
                success: true,
                statusCode: 200,
                msg: "Registration successful.",
                data: [{
                    customer: saved,
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