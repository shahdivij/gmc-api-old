const express = require('express')
const Cleaner = require('../../../models/cleaner/cleaner.model')
const { param, body, matchedData } = require('express-validator')

const { isValidObjectId, getNextSequence } = require('./../../../utility/common_api_functions')
const { STATUS_CODE, getStatusString } = require('../../../utility/status')
const { default: mongoose } = require('mongoose')
const CONSTANT = require('./../../../utility/constants')

const router = express.Router()

const paramsValidator = () => {
    return [
        param('id').notEmpty().custom(value => {
            if(!isValidObjectId(value)) throw new Error("Invalid Cleaner ID.")
        })
    ]
}

const bodyValidators = () => {
    return [
        body('firstname').notEmpty().withMessage("Cleaner firstname is required."),
        body('middlename').optional(),
        body('lastname').notEmpty().withMessage("Cleaner lastname is required."),
        body('mobile_number').notEmpty().withMessage('Cleaner mobile number is required.'),
        body("address.line_1").trim().notEmpty().withMessage("Cleaner Address Line 1 is required"),
        body("address.area").trim().notEmpty().withMessage("Cleaner Address Area is required"),
        body("address.city").trim().notEmpty().withMessage("Cleaner Address City is required"),
        body("address.state").trim().notEmpty().withMessage("Cleaner Address State is required"),
        body("address.country").trim().notEmpty().withMessage("Cleaner Address Country is required"),
        body("address.zip_code").trim().notEmpty().withMessage("Cleaner Address Zip Code is required"),
        body("cleaner_picture.name").trim().notEmpty().withMessage("Cleaner Picture Name is required"),
        body("cleaner_picture.image_data").trim().notEmpty().withMessage("Cleaner Picture Image Data is required"),
        body('is_approved').optional().default(false)
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

router.get("/", async (req, res) => {
    try {
        const cleaners = await Cleaner.find()
        return res.status(STATUS_CODE.OK).json({
            success: true, 
            statusCode: STATUS_CODE.OK,
            data: cleaners,
            msg: "Cleaners data."
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false, 
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        })
    }
}).get("/:id", paramsValidator(), async (req, res) => {
    const cleaner_id = req.params.id
    try {
        const cleanerData = await Cleaner.find({_id: cleaner_id})
        return res.status(STATUS_CODE.OK).json({
            success: true, 
            statusCode: STATUS_CODE.OK,
            data: cleanerData,
            msg: "Cleaner data."
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false, 
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        })
    }
    
}).post("/", bodyValidators(), validateBody, async (req, res) => {
    const cleanerData = matchedData(req)

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const exists = await Cleaner.exists({mobile_number: cleanerData.mobile_number})
        if(exists){
            return res.status(STATUS_CODE.ALREADY_EXIST).json({
                success: false,
                statusCode: STATUS_CODE.ALREADY_EXIST,
                msg: "Cleaner already exist with this number.",
                errors: []
            })
        }

        const cleaner_id = await getNextSequence(CONSTANT.MODEL.CLEANER, session)
        const cleaner = new Cleaner({
            ...cleanerData,
            cleaner_id,
        })

        const saved = await cleaner.save()

        session.commitTransaction()

        return res.status(STATUS_CODE.CREATED).json({
            success: true,
            statusCode: STATUS_CODE.CREATED,
            msg: "New Cleaner added successfully.",
            data: [saved]
        })

    } catch (error) {
        session.abortTransaction()
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
        })
    }

}).put("/:id", paramsValidator(), async (req, res) => {

}).delete("/:id", paramsValidator(), async (req, res) => {

})

module.exports = router