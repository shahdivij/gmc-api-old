const { body, param, validationResult } = require("express-validator")
const { STATUS_CODE, getStatusString } = require("../../../utility/status")
const { isValidObjectId } = require("../../../utility/common_api_functions")

const bodyValidators = () => {
    return [
        body('end_time.hour').notEmpty().withMessage('Time Slot start time hour is required.'),
        body('end_time.minute').notEmpty().withMessage('Time Slot start time minute is required.'),
        body('end_time.ampm').notEmpty().withMessage('Time Slot start time am/pm is required.'),
        body('start_time.hour').notEmpty().withMessage('Time Slot start time hour is required.'),
        body('start_time.minute').notEmpty().withMessage('Time Slot start time minute is required.'),
        body('start_time.ampm').notEmpty().withMessage('Time Slot start time am/pm is required.'),
        body('visible').optional().default(true),
    ]
}

const validateBody = async (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()) {
        next()
    } else {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            success: false,
            statusCode: STATUS_CODE.BAD_REQUEST,
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            errors: [...errors['errors']]
        })
    }
} 

const slotIdParamValidator = () => {
    return [
        param('slot_id').notEmpty().custom(value => {
            if(!isValidObjectId(value)) throw new Error('Invalid Time Slot ID: ' + value)
            return true
        })
    ]
}

module.exports = {
    bodyValidators,
    validateBody,
    slotIdParamValidator
}

