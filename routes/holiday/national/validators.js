const { body } = require("express-validator")

const postBodyValidators = () => {
    return [
        body('name').trim().notEmpty().withMessage("National Holiday name is required."),
        body('day').trim().notEmpty().withMessage("Day is required."),
        body('month').trim().notEmpty().withMessage("Month is required."),
    ]
}

module.exports = {
    postBodyValidators
}