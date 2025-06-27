const { body } = require("express-validator")
const { isValidObjectId } = require("../../utility/common_api_functions")
const Schedule = require("../../models/schedule/schedule.model")

const postBodyValidators = () => {
    return[
        body('subscription').trim().notEmpty().custom(async value => {
            if(!isValidObjectId(value)) throw new Error("Invalid Subscription ID passed.")
        }),
        body('dates').notEmpty().isArray().custom(async value => {
            if((value && value.length == 0) || !value) throw new Error("Schedule dates are required.")
        }),
        body('dates.*.date'),
        body('dates.*.cleaning_type').trim().optional().custom(async value => {
            if(value != "EXTERNAL" || value != "INTERNAL") throw new Error("Invalid cleaning type. It should be either EXTERNAL or INTERNAL")
        }),
        body('dates.*.day_type').trim().notEmpty().custom(async value => {
            if(!["WORKING_DAY", "NON_WORKING_DAY", "LOCAL_HOLIDAY", "NATIONAL_HOLIDAY", "OFF_DAY"].includes(value)) throw new Error("Invalid Day type. It should be one of " + ["WORKING_DAY", "NON_WORKING_DAY", "LOCAL_HOLIDAY", "NATIONAL_HOLIDAY", "OFF_DAY"])
        }),
        body('dates.*.cleaner').trim().notEmpty().custom(async value => {
            if(!isValidObjectId(value)) throw new Error("Invalid Cleaner ID passed.")
        }),
    ]
}

const scheduleStatusBodyValidators = () => {
    return [
        body("schedule").trim().custom(async value => {
            if(!value) throw new Error("Schedule ID is required.")
 
            if(!isValidObjectId(value)) throw new Error("Invalid Schedule ID passed.")

            const exists = await Schedule.exists({_id: value})
            if(!exists) throw new Error("Schedule does not exist with give ID.")
        }),
        body("status").trim().notEmpty(),
        body("date").trim().notEmpty()
    ]
}

module.exports = {
    postBodyValidators,
    scheduleStatusBodyValidators
}