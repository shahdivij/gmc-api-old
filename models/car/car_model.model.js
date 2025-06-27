const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const modelPictureSchema = mongoose.Schema({
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

const carModelSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car Model name is required."],
        unique: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car_Category',
        required: [true, "Car Model Category is required."]
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car_Brand',
        required: [true, "Car Brand is required."]
    },
    model_id: {
        type: String,
        required: [true, "Car Model ID is required."]
    },
    model_picture: {
        type: modelPictureSchema,
        required: false,
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


const Model = mongoose.model(CONSTANT.MODEL.CAR.MODEL, carModelSchema)

module.exports = Model
