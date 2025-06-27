const mongoose = require('mongoose')
const CONSTANTS = require('./../../utility/constants')

const qrCodeSchema = mongoose.Schema({
    qr_code_id: {
        type: String,
        required: [true, "QR Code ID is required."]
    },
    series_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANTS.MODEL.QRCODE_SERIES,
        required: [true, "QR Code Series ID is required."]
    },
    data: {
        image_data: {
            type: String,
            default: null
        },
        generated_at: {
            type: mongoose.Schema.Types.Date,
        },
        generated_by: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },
    is_active: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANTS.MODEL.CUSTOMER,
        default: null
    },
    is_archived: {
        type: Boolean,
        required: [true, "QR Code Series archive status is required."],
        default: false
    }
})

const QRCode = mongoose.model(CONSTANTS.MODEL.QRCODE, qrCodeSchema)

module.exports = QRCode