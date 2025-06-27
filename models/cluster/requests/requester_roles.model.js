const mongoose = require('mongoose')
const CONSTANTS = require('../../../utility/constants')

const requesterRoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Requester Role name is required."],
        unique: true,
        trim: true
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

const RequesterRole = mongoose.model(CONSTANTS.MODEL.CLUSTER.REQUESTER_ROLE, requesterRoleSchema)

module.exports = RequesterRole