const mongoose = require('mongoose')
const CONSTANTS = require('./../../utility/constants')

const qrCodeSeriesSchema = mongoose.Schema({
    series_id: {
        type: String,
        required: [true, "QR Code Series ID is required."]
    },
    name: {
        type: String,
        required: [true, "QR Code Series name is required."],
        unique: true,
        trim: true
    },
    range: {
        type: String,
        trim: true,
        required: [true, "QR Code Series Range is required."]
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANTS.MODEL.CLUSTER.CLUSTER,
        default: null
    },
    qr_codes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANTS.MODEL.QRCODE
    }],
    is_in_use: {
        type: Boolean,
        required: [true, "QR Code Series use status is required."],
        default: false
    },
    next_to_assign: {
        type: String,
        default: null
    },
    is_archived: {
        type: Boolean,
        required: [true, "QR Code Series archive status is required."],
        default: false
    },
    generated_range: {
        type: String,
        default: null
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const QRCodeSeries = mongoose.model(CONSTANTS.MODEL.QRCODE_SERIES, qrCodeSeriesSchema)

module.exports = QRCodeSeries