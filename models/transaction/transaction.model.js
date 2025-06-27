const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const transactionSchema = mongoose.Schema({
    transaction_id: {
        type: String,
        required: [true, 'Transaction ID is required.'],
        unique: true
    },
    payment_id: {
        type: String,
        required: [true, 'Payment ID is required.'],
    },
    order_id: {
        type: String,
        required: [true, 'Order ID is required.'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required.']
    },
    paid_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CUSTOMER,
        required: [true, 'Paid by is required.']
    },
    subscription_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.SUBSCRIPTION,
        required: [true, "Subscription ID is required."]
    },
    method: {
        type: String
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const Transaction = mongoose.model(CONSTANT.MODEL.TRANSACTION, transactionSchema)

module.exports = Transaction