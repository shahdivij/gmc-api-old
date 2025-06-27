const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const idsSchema = mongoose.Schema({
    [CONSTANT.MODEL.CUSTOMER]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CLEANER]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.SUPERVISOR]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CAR.CAR]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CLUSTER.CLUSTER]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CAR.MODEL]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CAR.CATEGORY]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CAR.BRAND]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.ADMIN]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CLUSTER.REQUEST]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.QRCODE_SERIES]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CUSTOMER_CAR]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.PACKAGE]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.SUBSCRIPTION]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.SCHEDULE]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.CHANGE_ADDRESS_REQUEST]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.DISCOUNT]: {
        type: Number,
        default: 0
    },
    [CONSTANT.MODEL.TRANSACTION]: {
        type: Number,
        default: 0
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

const IDs = mongoose.model("id", idsSchema)

module.exports = IDs