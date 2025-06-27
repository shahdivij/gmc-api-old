const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const residenceTypeSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Residence type name is required."], 
        unique: true,
        trim: true,
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


const ResidenceType = mongoose.model(CONSTANT.MODEL.RESIDENCE, residenceTypeSchema)

module.exports = ResidenceType