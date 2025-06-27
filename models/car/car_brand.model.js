const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const carLogoSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Image name is required."],
        lowercase: true,
        trim: true
    },
    image_data: {
        type: String,
        required: [true, "Image data is required."]
    }
})

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car Brand name is required."],
        unique: true,
        trim: true,
    },
    logo: {
        type: carLogoSchema,
        required: [true, "Car logo is required."],
        unique: true
    },
    models: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Car_Model',
    }],
    brand_id: {
        type: String, 
        required: [true, "Car Brand ID is required."]
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

const Brand = mongoose.model(CONSTANT.MODEL.CAR.BRAND, brandSchema)

module.exports = Brand
