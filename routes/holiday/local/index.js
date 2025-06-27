const express = require('express')
const router = express.Router()
const { STATUS_CODE, getStatusString } = require('../../../utility/status')
const LocalHoliday = require('../../../models/holiday/localholiday.model')
const { postBodyValidators } = require('./validators')
const { validationResult, matchedData } = require('express-validator')

router.get("/", async (req, res) => {
    try {
        const data = await LocalHoliday.find()
        return res.status(STATUS_CODE.OK).json({
            msg: 'Local Holidays data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
}).post("/", postBodyValidators(), async (req, res) => {
    
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }

    const matchedBodyData = matchedData(req)

    try {

        const existsDate = await LocalHoliday.exists({city: matchedBodyData.city})
        if(existsDate){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "city",
                    value: matchedBodyData.city,
                    msg: `City already exists.`
                }]
            })
        }
        
        const newHoliday = new LocalHoliday({
            city: matchedBodyData.city,
            holidays: matchedBodyData.holidays
        })

        const saved = await newHoliday.save()

        return res.status(STATUS_CODE.OK).json({
            msg: "Local Holiday added successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: saved
        })

    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
}).put("/:id", async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
}).delete("/:id", async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
})

module.exports = router