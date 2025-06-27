const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const localHolidaySchema = mongoose.Schema({
    city: {
        type: String,
        required: [true, "City name is required."]
    },
    holidays: [{
        name: {
            type: String,
            required: [true, "Local Holiday Name is required."],
        },
        date: {
            type: Date,
            required: [true, "Local Holiday Date is required."],
        }
    }]
})

const LocalHoliday = mongoose.model(CONSTANT.MODEL.HOLIDAY.LOCAL, localHolidaySchema)

module.exports = LocalHoliday