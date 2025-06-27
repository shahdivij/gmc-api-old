const mongoose = require('mongoose')
const CONSTANT = require("./../../../utility/constants")

const changeAddressRequestSchema = mongoose.Schema({
    request_id: {
        type: String,
        required: [true, "Address Change Request ID is required."],
        trim: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, "Customer ID is required."],
    },
    address_to_change: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Address ID is required."],
    },
    status: {
        type: String,
        enum: ["OPEN", "IN_PROGRESS", "CLOSED"],
        default: "OPEN"
    },
    comment: {
        type: String,
        trim: true,
        default: null
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const ChangeAddressRequest = mongoose.model(CONSTANT.MODEL.CHANGE_ADDRESS_REQUEST, changeAddressRequestSchema)

module.exports = ChangeAddressRequest