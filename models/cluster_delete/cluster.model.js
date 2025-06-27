const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants')

const clusterSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Cluster name is required."],
        unique: true
    },
    value: {
        type: String,
        required: [true, "Cluster display value is required."],
        unique: true
    },
    apartments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.APARTMENT,
    }],
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANTS.MODEL.CUSTOMER
    }],
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

const Cluster = mongoose.model(CONSTANTS.MODEL.CLUSTER.CLUSTER, clusterSchema)

module.exports = Cluster