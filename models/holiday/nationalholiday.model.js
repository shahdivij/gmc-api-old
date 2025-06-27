const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants')

const nationalHolidaySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "National Holiday Name is required."],
        unique: true
    },
    day: {
        type: Number,
        required: [true, "Day is required."],
    },
    month: {
        type: Number,
        required: [true, "Month is required."]
    }
})


const NationalHoliday = mongoose.model(CONSTANT.MODEL.HOLIDAY.NATIONAL, nationalHolidaySchema)

module.exports = NationalHoliday