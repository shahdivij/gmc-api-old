const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const registrationTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car registration type name is required."],
        trim: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}) 

const Registration = mongoose.model(CONSTANT.MODEL.CAR.REGISTRATION, registrationTypeSchema)

module.exports = Registration