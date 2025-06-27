const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const transmissionTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car transmission type name is required."],
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

const Transmission = mongoose.model(CONSTANT.MODEL.CAR.TRANSMISSION, transmissionTypeSchema)

module.exports = Transmission