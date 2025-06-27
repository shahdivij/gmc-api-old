const { body } = require("express-validator")
const { DateTime } = require("luxon")

const postBodyValidators = () => {
    return[
        body('holidays').notEmpty().custom(async (value) => {
            if(value.length < 1) throw new Error("Local Holidays are required.")
        }),
        body('holidays.*.name').trim().notEmpty().withMessage("Local Holiday name is required."),
        body('holidays.*.date').trim().notEmpty().isDate().custom(async value => {
            if(!value) throw new Error("Local Holiday date is required.")
            const date = DateTime.fromJSDate(value).toISO()
            const currentDate = DateTime.now().toISO()
            if(date < currentDate){
                throw new Error("Date can not be a past date.")
            }
        }),
        body('city').trim().notEmpty().withMessage("Local Holiday City name is required.")
    ]
}

module.exports = {
    postBodyValidators
}