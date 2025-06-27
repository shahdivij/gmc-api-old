const express = require('express')
const { body, validationResult } = require('express-validator')
const { isValidObjectId } = require('../../../utility/common_api_functions')
const QRCodeSeries = require('../../../models/qrcodeseries/qrcodeseries.model')
const QRCode = require('../../../models/qrcode/qrcode.model')
const router = express.Router()
const QRCodeGenerator = require('qrcode')
const Cryptr = require('cryptr');
const { default: mongoose } = require('mongoose')
const axios = require('axios')

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
            success: false,
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
            success: false,
            statusCode: 409,
            msg: "Invalid QR Code Series ID.",
        })
    }else{
        next()
    }
}



router.post("/", validators(), validateBody, validateObjectID ,async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        console.log("GENERATE QR CODE FUNCTION STARTS...")
        const seriesID = req.body.series_id
        const exist = await QRCodeSeries.exists({_id: seriesID})
        if(!exist){
            return res.status(404).json({
                success: false,
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
        let generatedRange = range
        let generatedStarting = starting
        let generatedEnding = ending
        const seriesData = await QRCodeSeries.find({_id: seriesID})
        if(seriesData){
            generatedRange = seriesData[0].generated_range
            if(generatedRange){
                generatedStarting = generatedRange && generatedRange.trim().split('-')[0]
                generatedEnding = generatedRange && generatedRange.trim().split("-")[1]
                if(ending <= generatedEnding || starting <= generatedEnding){
                    return res.status(409).json({
                        statusCode: 409,
                        success: false,
                        data: null,
                        errors: [{
                            "type": "field",
                            "value": range,
                            "msg": "QR Codes for the given range are already generated.",
                            "path": "range",
                            "location": "body"
                        }],
                        msg: "QR Codes for the given range are already generated.",
                    });
                }
            }
        }

        const qrCodesIDArray = []
        for(let i=starting; i <= ending; i++){
            const id = seriesData[0].name + "_" + i
            qrCodesIDArray.push(id)
        }
        // console.log('qrCodesIDArray -> ', qrCodesIDArray)
        var opts = {
            errorCorrectionLevel: 'H',
            // type: 'svg',
            quality: 1,
            margin: 1,
            // color: {
            //   dark:"#010599FF",
            //   light:"#FFBF60FF"
            // }
        }

        const qrCodesData = await QRCode.find({qr_code_id: { $in: qrCodesIDArray }})
        const dataToSave = []             
        
        // console.log('qrCodesData -> ', qrCodesData)
        for(const index in qrCodesData){
            const qrcode = qrCodesData[index]
            const cryptr = new Cryptr('myTotallySecretKey')
            const encryptedString = cryptr.encrypt(JSON.stringify(`{series_id: ${seriesData[0]._id}, qr_code_id: ${qrcode._id}}`))

            const qr = await axios.get(`http://api.qrserver.com/v1/create-qr-code/?data=${encryptedString}&size=350x350&charset-source=ISO-8859-1&ecc=H&format=svg`)
            // console.log(qr.data)
            const splitted = qr.data.split("</g>")
            let newSVG = splitted[0] + '<text x="50%" font-size="25" y="320" text-anchor="middle" fill="black">' + qrcode.qr_code_id + '</text>' + "</g>" + splitted[1] 
            newSVG = newSVG.replace('width="291"', 'width="400"')
            newSVG = newSVG.replace('height="291"', 'height="400"')
            // console.log(newSVG)
            // dataToSave.push({
            //     _id: qrcode._id,
            //     data: {
            //         image_data: dataUrl.toString(), 
            //         generated_at: Date.now()
            //     }
            // })
            // console.log(dataUrl)
            // QRCodeGenerator.toDataURL(encryptedString, opts, async function (err, url) { 
            //     const canvas = createCanvas(270, 420)
            //     const ctx = canvas.getContext('2d')
            //     ctx.font = '30px Impact'
            //     ctx.fillStyle = "white";
            //     ctx.fillRect(0, 0, 270, 420)
            //     ctx.strokeRect(5, 5, 260, 410)
            //     ctx.fillStyle = "black";
            //     ctx.fillText(qrcode.qr_code_id, 50, 380)
            //     ctx.fillText("Go Motor Car", 45, 55)
            //     ctx.fillStyle = "black"
            //     const img = new Image(250, 250)
            //     img.onload = function(){
            //         ctx.drawImage(img,10,100, 250, 250)
            //     }
            //     img.src = url;
            //     const dataUrl = canvas.toDataURL()
            //     dataToSave.push({
            //         _id: qrcode._id,
            //         data: {
            //             image_data: dataUrl.toString(), 
            //             generated_at: Date.now()
            //         }
            //     })
                const r = await QRCode.findOneAndUpdate({_id: qrcode._id}, {data: {image_data: newSVG.toString(), generated_at: Date.now()}}, {new: true}).session(session)
            // })            
        }

        if(seriesData[0].next_to_assign == null){
            await QRCodeSeries.findOneAndUpdate({_id: seriesID}, {generated_range: generatedStarting + "-" + ending, next_to_assign: seriesData[0].name + "_" + (seriesData[0].range.trim().split('-')[0])}, {new: true}).session(session)
        } else {
            await QRCodeSeries.findOneAndUpdate({_id: seriesID}, {generated_range: generatedStarting + "-" + ending}, {new: true}).session(session)
        }
        
        session.commitTransaction()

        console.log("GENERATE QR CODE FUNCTION ENDS !")

        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "QR Codes generated successfully.",
            data: []
        });
    
        
    } catch (error) {
        console.log("GENERATE QR CODE FUNCTION [ERROR]...")
        console.log(error)
        session.abortTransaction()
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
