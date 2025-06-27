const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { isValidObjectId } = require('../../../utility/common_api_functions')
const QRCodeSeries = require('./../../../models/qrcodeseries/qrcodeseries.model')
const QRCode = require('./../../../models/qrcode/qrcode.model')
const fs = require("fs")

const validators = () => {
    return [
        body("series_id").trim().notEmpty().withMessage("QR Code Series ID is required."), 
        body("range").trim().notEmpty().withMessage("QR Code range is required."),
    ]
}

const validateBody = async (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()) {
        next()
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [...errors['errors']]
        })
    }
}

const validateObjectID = async (req, res, next) => {
    const seriesID = req.body.series_id
    if(!isValidObjectId(seriesID)){
        return res.status(409).json({
            success: "false",
            statusCode: 409,
            msg: "Invalid QR Code Series ID.",
            errors: [...errors['errors']]
        })
    }else{
        next()
    }
}

router.post("/", validators(), validateBody, validateObjectID, async (req, res) => {
    try {
        const seriesID = req.body.series_id
        const exist = await QRCodeSeries.exists({_id: seriesID})
        if(!exist){
            return res.status(404).json({
                success: "false",
                statusCode: 404,
                msg: "QR Code Series does not exist.",
                errors: [{
                    "type": "field",
                    "value": seriesID,
                    "msg": "QR Code Series does not exist. Could not generate QR Codes.",
                    "path": "name",
                    "location": "body"
                }]
            })
        }
        
        const range = req.body.range
        const starting = range && range.trim().split('-')[0]
        const ending = range && range.trim().split("-")[1]
        
        const seriesData = await QRCodeSeries.find({_id: seriesID})
        if(seriesData){
            const generatedRange = seriesData[0].generated_range
            if(generatedRange){
                const generatedStarting = generatedRange && generatedRange.trim().split('-')[0]
                const generatedEnding = generatedRange && generatedRange.trim().split("-")[1]
                if(ending > generatedEnding || starting < generatedStarting){
                    return res.status(409).json({
                        statusCode: 409,
                        success: false,
                        data: null,
                        errors: [{
                            "type": "field",
                            "value": range,
                            "msg": "No QR Codes are generated for the given range.",
                            "path": "range",
                            "location": "body"
                        }],
                        msg: "No QR Codes are generated for the given range.",
                    });
                }
            }else{
                return res.status(409).json({
                    statusCode: 409,
                    success: false,
                    data: null,
                    errors: [{
                        "type": "field",
                        "value": range,
                        "msg": "No QR Codes are generated for the given QR Code Series. Please generate first.",
                        "path": "range",
                        "location": "body"
                    }],
                    msg: "No QR Codes are generated for the given QR Code Series. Please generate first.",
                });
            }
        }

        const qrCodesIDArray = []
        for(let i=starting; i <= ending; i++){
            const id = seriesData[0].name + "_" + i
            qrCodesIDArray.push(id)
        }
        
        const qrCodesData = await QRCode.find({qr_code_id: { $in: qrCodesIDArray }})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }],
            msg: "Internal Server Error. Could not generate QR Codes.",
        });
    } 
})

module.exports = router
