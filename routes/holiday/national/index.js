const express = require('express')
const router = express.Router()
const { STATUS_CODE, getStatusString } = require('../../../utility/status')
const NationalHoliday = require('./../../../models/holiday/nationalholiday.model')
const { postBodyValidators } = require('./validators')
const { validationResult, matchedData } = require('express-validator')
const { DateTime } = require('luxon')
const { isValidObjectId } = require('../../../utility/common_api_functions')

router.get("/", async (req, res) => {
    try {
        const data = await NationalHoliday.find()
        return res.status(STATUS_CODE.OK).json({
            msg: 'National Holidays data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
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

        const existsDate = await NationalHoliday.exists({$and: [{day: matchedBodyData.day}, {month: matchedBodyData.month}]})
        if(existsDate){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: 'National Holiday date already exists.',
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "date",
                    value: matchedBodyData.date,
                    msg: `National Holiday date already exists.`
                }]
            })
        }   
        
        const existsName = await NationalHoliday.exists({name: matchedBodyData.name})
        if(existsName){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: 'National Holiday name already exists.',
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "name",
                    value: matchedBodyData.name,
                    msg: `National Holiday name already exists.`
                }]
            })
        } 

        const newHoliday = new NationalHoliday({
            name: matchedBodyData.name,
            day: matchedBodyData.day,
            month: matchedBodyData.month,
        })

        const saved = await newHoliday.save()

        return res.status(STATUS_CODE.OK).json({
            msg: "National Holiday added successfully.",
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
}).put("/:id", postBodyValidators(), async (req, res) => {
    const { id } = req.params
    console.log(id)
    if(!id){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: "National Holiday ID is required.",
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                msg: "National Holiday ID is required.",
                type: "field",
                field: "id",
                location: "params",
                value: id
            }]
        })
    }
    
    if(!isValidObjectId(id)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: "National Holiday ID is invalid.",
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                msg: "National Holiday ID is invalid.",
                type: "field",
                field: "id",
                location: "params",
                value: id
            }]
        })
    }
    try {
        const exists = await NationalHoliday.exists({_id: id})
        if(!exists){
            return res.status(STATUS_CODE.NOT_FOUND).json({
                msg: "National Holiday does not exist with given id.",
                statusCode: STATUS_CODE.NOT_FOUND,
                success: false,
                errors: [{
                    msg: "National Holiday does not exist with given id.",
                    type: "field",
                    field: "id",
                    location: "params",
                    value: id
                }]
            })
        }

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

        const existsDate = await NationalHoliday.exists({$and: [{day: matchedBodyData.day}, {month: matchedBodyData.month}, {_id: {$ne: id}}]})
        if(existsDate){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: "National Holiday date already exists.",
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "date",
                    value: matchedBodyData.date,
                    msg: `National Holiday date already exists.`
                }]
            })
        }   
        
        const existsName = await NationalHoliday.exists({$and: [{name: matchedBodyData.name}, {_id: {$ne: id}}]})
        if(existsName){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: "National Holiday name already exists.",
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "name",
                    value: matchedBodyData.name,
                    msg: `National Holiday name already exists.`
                }]
            })
        }

        const updated = await NationalHoliday.findByIdAndUpdate(id, {name: matchedBodyData.name, day: matchedBodyData.day, month: matchedBodyData.month}, {new: true})

        return res.status(STATUS_CODE.OK).json({
            msg: "National Holiday updated successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: updated
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
}).delete("/:id", async (req, res) => {
    const { id } = req.params
    if(!id){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: "National Holiday ID is required.",
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                msg: "National Holiday ID is required.",
                type: "field",
                field: "id",
                location: "params",
                value: id
            }]
        })
    }
    
    if(!isValidObjectId(id)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: "National Holiday ID is invalid.",
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                msg: "National Holiday ID is invalid.",
                type: "field",
                field: "id",
                location: "params",
                value: id
            }]
        })
    }

    try {
        const exists = await NationalHoliday.exists({_id: id})
        if(!exists){
            return res.status(STATUS_CODE.NOT_FOUND).json({
                msg: "National Holiday does not exist with given id.",
                statusCode: STATUS_CODE.NOT_FOUND,
                success: false,
                errors: [{
                    msg: "National Holiday does not exist with given id.",
                    type: "field",
                    field: "id",
                    location: "params",
                    value: id
                }]
            })
        }     
        
        await NationalHoliday.findByIdAndDelete(id)
        
        return res.status(STATUS_CODE.OK).json({
            msg: getStatusString(STATUS_CODE.OK),
            statusCode: STATUS_CODE.OK,
            success: true,
            data: exists
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
})

module.exports = router