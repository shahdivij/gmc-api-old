const express = require('express')
const router = express.Router()

const seriesRoutHandler = require('./series')
const generateRoutHandler = require('./generate')
const printRoutHandler = require('./print')
const QRCode = require('../../models/qrcode/qrcode.model')
const { STATUS_CODE, STATUS_STRING } = require('../../utility/status')

router.use('/series', seriesRoutHandler)
router.use('/generate', generateRoutHandler)
router.use('/print', printRoutHandler)

router.get("/", async (req, res) => {
    try {
        const qrCodes = await QRCode.find()
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "QR Codes data.",
            data: qrCodes
        });
        
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: "true",
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            msg: STATUS_STRING.INTERNAL_ERROR,
            data: null
        });
    }
})

module.exports = router