const mongoose = require('mongoose');
const CONSTANT = require('../../utility/constants');


const tipSchema = new mongoose.Schema(
    {
        cleaner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: CONSTANT.MODEL.CLEANER,
            required: [true, 'Service Person ID is required']
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: CONSTANT.MODEL.CUSTOMER,
            required: [true, 'Customer ID is required']
        },
        amount: {
            type: Number,
            required: [true, 'Tip amount is required'],
            min: [0, 'Tip amount must be positive']
        },
        transactionDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Tip = mongoose.model('Tip', tipSchema);

module.exports = Tip;
