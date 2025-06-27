const { body, validationResult } = require("express-validator")
const { STATUS_CODE, getStatusString } = require('./../../utility/status')
const { isValidObjectId } = require("../../utility/common_api_functions")
const { checkDocumentExists } = require("../../utility/commonValidators")
const Discount = require("../../models/discount/discount.model")

const bodyValidators = () => {
    return [
        body('name').trim().notEmpty().withMessage("Discount name is required."),
        body('discount_upto_amount').trim().notEmpty().withMessage("Discount upto amount is required."),
        body('discount_amount').trim().notEmpty().withMessage("Discount amount is required."),
        body('discount_percent').trim().notEmpty().withMessage("Discount percent is required."),
        body('discount_code').trim().notEmpty().withMessage("Discount code is required."),
        body('service').trim().notEmpty().withMessage("Discount service is required."),
        body('description').optional(),
    ]
}

const validateBody = async (req, res, next) => {
    const result = validationResult(req)
    console.log(result.array())
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }

    next()
}

const checkObjectID = async (req, res, next) => {
    const { id } = req.params
    if(!id){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: 'field',
                value: '',
                msg: 'No Discount ID is passed',
                path: 'id',
                location: 'params'
            }]
        })
    }

    if(!isValidObjectId(id)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: 'field',
                value: id,
                msg: 'Invalid Discount ID.',
                path: 'id',
                location: 'params'
            }]
        })
    }

    next()
}

const checkDiscountExist = async (req, res, next) => {
    const { id } = req.params
    if(!checkDocumentExists(Discount, {_id: id})){
        return res.status(STATUS_CODE.NOT_FOUND).json({
            msg: getStatusString(STATUS_CODE.NOT_FOUND),
            statusCode: STATUS_CODE.NOT_FOUND,
            success: false,
            errors: [{
                type: 'field',
                value: id,
                msg: 'Discount does not exist with given id.',
                path: 'id',
                location: 'params'
            }]
        })
    }

    next()
}

module.exports = {
    bodyValidators,
    validateBody,
    checkObjectID,
    checkDiscountExist
}