const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const scheduleSchema = mongoose.Schema({
    schedule_id: {
        type: String,
        required: [true, "Schedule ID is required"]
    },
    dates: [
        {
            date: {
                type: Date,
                required: [true, "Date is required."]
            },
            cleaning_type: {
                type: String,
                enum: ["INTERIOR", "EXTERIOR", null],
                default: null
            },
            day_type: {
                type: String,
                enum: ["WORKING_DAY", "NON_WORKING_DAY", "LOCAL_HOLIDAY", "NATIONAL_HOLIDAY", "OFF_DAY"],
            },
            status: {
                type: String,
                default: 'INCOMPLETE',
                enum: ["INCOMPLETE", "COMPLETE", "INPROGRESS", "DISPUTED"]
            },
            cleaner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'cleaner'
            }
        }
    ],
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.SUBSCRIPTION,
        required: [true, "Subscription ID is required."]
    }
})

const Schedule = mongoose.model(CONSTANT.MODEL.SCHEDULE, scheduleSchema)

module.exports = Schedule