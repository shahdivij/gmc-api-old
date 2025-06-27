const Package = require('../../models/package/package.model')
const { body, param } = require('express-validator')
const { isValidMongoObjectID, checkDocumentExists } = require('./../../utility/commonValidators')

const queryValidators = () => {
    return [
        param('id').trim().notEmpty().escape().custom(async (value) => {
            if(! await isValidMongoObjectID(value)) throw new Error('Invalid Package ID is provided')
            if(! await checkDocumentExists(Package, {_id: value})) throw new Error("Package does not exist with this package ID.")
        })
    ]
}

const bodyValidators = () => {
    return [
        body('name').trim().notEmpty().withMessage("Package name is required."),
        body('number_of_days').notEmpty().isNumeric().custom(async (value, {req}) => {
            if(value < parseInt(req.body.interior_cleaning) + parseInt(req.body.exterior_cleaning)) throw new Error("Number of days can not be less than sum of number of interior and exterior cleanings.")
        }),
        body('prices.*.category').trim().notEmpty().withMessage("Car category is required for price data."),
        body('prices.*.actual_price').trim().notEmpty().withMessage("Actual price is required for price data."),
        body('prices.*.strikethrough_price').optional().trim(),
        body('prices.*.int_refund_price').optional().trim(),
        body('prices.*.ext_refund_price').optional().trim(),
        body('description').optional().trim(),
        body('interior_cleaning').trim().notEmpty().isDecimal().withMessage("Number of Interior cleanings are required and should be positive number"),
        body('exterior_cleaning').trim().notEmpty().isDecimal().withMessage("Number of Exterior cleanings are required and should be positive number."),
        body('taxes.*.name').optional().trim().notEmpty().withMessage("Tax name is required."),
        body('taxes.*.value').optional().trim().notEmpty().isDecimal().withMessage("Tax value is required and should be positive number."),
        body('visible').optional().isBoolean().withMessage("Package visibility must be either true or false."),
        body('package_type').optional(),
        body('_2nd_car_onward_off').optional()
    ]
}

module.exports = {
    queryValidators, 
    bodyValidators
}