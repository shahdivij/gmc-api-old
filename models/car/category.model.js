const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const categorySchema = mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Car category name is required."], 
        unique: true,
        trim: true,
    },
    category_id: {
        type: String,
        required: [true, "Car Category ID is required."]
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


const Category = mongoose.model(CONSTANT.MODEL.CAR.CATEGORY, categorySchema)

module.exports = Category