const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const timeSlotSchema = mongoose.Schema({
    start_time: {
        hour: {
            type: String,
            required: true
        },
        minute: {
            type: String,
            required: true
        },
        ampm: {
            type: String,
            required: true,
            enum: ['AM', 'PM']
        }
    },
    end_time: {
        hour: {
            type: String,
            required: true
        },
        minute: {
            type: String,
            required: true
        },
        ampm: {
            type: String,
            required: true,
            enum: ['AM', 'PM']
        }
    },
    visible: {
        type: Boolean,
        default: true
    }
})

const TimeSlot = mongoose.model(CONSTANT.MODEL.TIME_SLOT, timeSlotSchema)

module.exports = TimeSlot