const express = require('express')
const router = express.Router()
const QRCodeSeries = require('./../../../models/qrcodeseries/qrcodeseries.model')
const {getNextSequence, decrementSequence, isValidObjectId} = require('./../../../utility/common_api_functions')
const CONSTANTS = require('./../../../utility/constants')
const { body, validationResult, matchedData } = require('express-validator')
const IDs = require('./../../../models/ids/ids.model')
const QRCode = require('../../../models/qrcode/qrcode.model')
const Cluster = require('./../../../models/cluster/cluster.model')
const { default: mongoose } = require('mongoose')

const validators = () => {
    return [
        body("name").trim().notEmpty().withMessage("QR Code Series Name is required."), 
        body("range").trim().notEmpty().withMessage("QR Code range is required."),
    ]
}

const assignBodyValidators = () => {
    return(
        [
            body('cluster').trim().notEmpty().custom(async (value) => {
                if(!isValidObjectId(value)) throw new Error("Invalid Cluster ID.")
                if(!Cluster.exists({_id: value})) throw new Error("Cluster does not exist with this cluster ID.")
            }),
            body('qr_code_series').trim().notEmpty().custom(async (value) => {
                if(!isValidObjectId(value)) throw new Error("Invalid QR Code Series ID.")
                if(!QRCodeSeries.exists({_id: value})) throw new Error("Cluster does not exist with this cluster ID.")
            })
        ]
    )
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

router.get("/", async (req, res) => {
    try {
        const seriesData = await QRCodeSeries.find().populate('cluster').exec()
        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: seriesData,
            msg: "QR Code Series data."
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false, 
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        })
    }
}).get("/:id", async (req, res) => {
    try {
        const seriesID = req.params.id
        if(!isValidObjectId(seriesID)){
            return res.status(400).json({
                success: "false",
                statusCode: 400,
                msg: "Invalid QR Code Series ID",
                errors: [{
                    "type": "params",
                    "value": seriesID,
                    "msg": "Invalid QR Code Series ID",
                    "path": "id",
                    "location": "params"
                }]
            });
        }
        const seriesData = await QRCodeSeries.find({_id: seriesID}).populate('qr_codes').exec()
        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: seriesData,
            msg: "QR Code Series data."
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false, 
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        })
    }
}).post("/", validators(), validateBody, async (req, res) => {
    const currentIdsData_ = await IDs.find()
    const seriesID = currentIdsData_[0].QrCode_Series
    try {
        let seriesName = req.body.name.trim().toLowerCase()
        seriesName = seriesName[0].toUpperCase() + seriesName.slice(1)
        const exist = await QRCodeSeries.exists({name: seriesName})
        if(exist){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Duplicate Entry.",
                errors: [{
                    "type": "field",
                    "value": seriesName,
                    "msg": "QR Code Series already exists with given name. Can not add duplicate entry.",
                    "path": "name",
                    "location": "body"
                }]
            })
        }
        
        const series_id = await getNextSequence(CONSTANTS.MODEL.QRCODE_SERIES)
        const newSeries = new QRCodeSeries({
            ...req.body,
            series_id
        })

        const result = await newSeries.save()

        if(result){
            const name = result.name
            const range = result.range
            const starting = range.trim().split('-')[0]
            const ending = range.trim().split('-')[1]
            const qrCodesData = []
            for(let i = parseInt(starting); i <= parseInt(ending); i++){
                const qrCodeData = new QRCode({
                    series_id: result._id,
                    qr_code_id: name + "_" + i,
                    data: {
                        image_data: null,
                        generated_at: Date.now(),
                        generated_by: null
                    }
                })
                const qrCodeResult = await qrCodeData.save()
                qrCodesData.push(qrCodeResult._id)
            }

            result.qr_codes = [...qrCodesData]
            result.save()

            return res.status(200).json({
                success: "true",
                statusCode: 200,
                msg: "New QR Code Series added successfully.",
                data: [result]
            });
        }
    
        
    } catch (error) {
        const currentIdsData_ = await IDs.find()
        const seriesID_ = currentIdsData_[0].QrCode_Series
        if(seriesID < seriesID_)
            await decrementSequence(CONSTANT.MODEL.QRCODE_SERIES)
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not add QR Code Series.",
        });
    } 
}).post("/assign", assignBodyValidators(), validateBody, async (req, res) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const { cluster, qr_code_series } = matchedData(req)
        const updatedCluster = await Cluster.findOneAndUpdate({_id: cluster}, {qr_code_series: qr_code_series}, {new: true}).session(session)
        const udpatedQrSeries = await QRCodeSeries.findOneAndUpdate({_id: qr_code_series}, {cluster: cluster}, {new: true}).session(session)
        session.commitTransaction()

        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "QR Code Series assigned to Cluster successfully.",
            data: []
        })

    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not add QR Code Series.",
        });
    }
}).put("/:id", async (req, res) => {
    const seriesID = req.params.id
    if(!isValidObjectId(seriesID)){
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Invalid QR Code Series ID",
            errors: [{
                "type": "params",
                "value": seriesID,
                "msg": "Invalid QR Code Series ID",
                "path": "id",
                "location": "params"
            }]
        });
    }
    
    try {
        const newRange = req.body.range 
        const updatedResult = await QRCodeSeries.findByIdAndUpdate(seriesID, {range: newRange}, {new: true})
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "Range is updated for QR Code series with ID " + seriesID,
            errors: [],
            data: updatedResult
        });
    } catch (error) {
        return res.status(500).json({
            success: "false",
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error. Could not update the QR Code Series.",
                "path": "",
                "location": ""
            }]
        });
    }

}).delete("/:id", async (req, res) => {
    const seriesID = req.params.id
    if(!isValidObjectId(seriesID)){
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Invalid QR Code Series ID",
            errors: [{
                "type": "params",
                "value": seriesID,
                "msg": "Invalid QR Code Series ID",
                "path": "id",
                "location": "params"
            }]
        });
    }
    
    try {
        const exists = await QRCodeSeries.exists({_id: seriesID}) 
        if(!exists){
            return res.status(409).json({
                statusCode: 409,
                success: false,
                data: null,
                msg: "QR Code Series does not exist with ID " + seriesID,
            });
        }

        const codeSeries = await QRCodeSeries.find({_id: seriesID}).populate()
        if(codeSeries[0].is_in_use){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "This QR Code Series is in use. Can not delete this.",
                errors: [{
                    "type": "params",
                    "value": seriesID,
                    "msg": "This QR Code Series is in use. Can not delete this.",
                    "path": "id",
                    "location": "params"
                }]
            });
        }
    
        const result = await QRCodeSeries.findOneAndDelete({_id: seriesID})
        const qrCodesDeleted = await QRCode.deleteMany({series_id : seriesID})
    
        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: result,
            msg: "QR Code Series deleted successfully with ID " + seriesID,
        });
    } catch (error) {
        return res.status(500).json({
            success: "false",
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error. Could not delete the QR Code Series.",
                "path": "",
                "location": ""
            }]
        });
    }
})

module.exports = router