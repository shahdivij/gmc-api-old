const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const fuelImageSchema = mongoose.Schema({
    name: {
        type: String,
        required: false,
        lowercase: true,
        trim: true
    },
    image_data: {
        type: String,
        required: false
    }
})

const fuelTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car Fuel type name is required."],
        trim: true,
        unique: true
    },
    image: {
        type: fuelImageSchema,
        required: false,
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

const Fuel = mongoose.model(CONSTANT.MODEL.CAR.FUEL, fuelTypeSchema)

module.exports = Fuel