const express = require('express')
const { STATUS_CODE, getStatusString } = require('../../utility/status')
const { bodyValidators, validateBody, checkObjectID, checkDiscountExist } = require('./validators')
const { matchedData } = require('express-validator')
const Discount = require('../../models/discount/discount.model')
const { default: mongoose } = require('mongoose')
const { getNextSequence } = require('../../utility/common_api_functions')
const router = express.Router()
const CONSTANT = require('./../../utility/constants')


router.get("/", async (req, res) => {
    try {
        const data = await Discount.find()
        return res.status(STATUS_CODE.OK).json({
            msg: 'Holidays data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })   
    }
}).get("/:code", async (req, res) => {
    const { code } = req.params
    if(!code) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: 'No Discount Code is passed',
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: 'field',
                value: '',
                msg: 'No Discount Code is passed',
                path: 'code',
                location: 'params'
            }]
        })
    }

    
    try {
        const exists = await Discount.exists({$and: [{discount_code: code}, {service: 'Hire Car Cleaner'}]})
        if(!exists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: 'Invalid Discount Code.',
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: 'field',
                    value: code,
                    msg: 'Invalid Discount Code.',
                    path: 'code',
                    location: 'params'
                }]
            })
        }
        
        return res.status(STATUS_CODE.OK).json({
            msg: 'Discount data.',
            data: exists,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })   
    }
}).post("/", bodyValidators(), validateBody, async (req, res) => {
    const matchedBodyData = matchedData(req)
    const session = await mongoose.startSession()
    try {
        const exists = await Discount.find({$or: [{name: matchedBodyData.name}, {discount_code: matchedBodyData.code}]})
        if(exists && exists.length > 0){
            return res.status(STATUS_CODE.ALREADY_EXIST).json({
                msg: getStatusString(STATUS_CODE.ALREADY_EXIST),
                statusCode: STATUS_CODE.ALREADY_EXIST,
                success: false,
                errors: []
            })   
        }
        
        session.startTransaction()
        
        const discountID = await getNextSequence(CONSTANT.MODEL.DISCOUNT, session)

        const discount = new Discount({
            ...matchedBodyData,
            discount_id: discountID
        })

        const saved = await discount.save({session: session})

        session.commitTransaction()

        return res.status(STATUS_CODE.OK).json({
            msg: getStatusString(STATUS_CODE.CREATED),
            data: saved,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        session.abortTransaction()
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })   
    }
}).put("/:id", checkObjectID, checkDiscountExist, bodyValidators(), validateBody, async (req, res) => {
    const { id } = req.params
    const matchedBodyData = matchedData(req)
    try {
        const updated = await Discount.findByIdAndUpdate(id, {...matchedBodyData}, {new: true})
        return res.status(STATUS_CODE.OK).json({
            msg: 'Discount updated successfully.',
            data: updated,
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
}).delete("/:id", checkObjectID, checkDiscountExist, async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Discount.find({_id: id})
        await Discount.findByIdAndDelete(id)
        return res.status(STATUS_CODE.OK).json({
            msg: 'Discount deleted successfully.',
            data: deleted,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })   
    }
})

module.exports = router