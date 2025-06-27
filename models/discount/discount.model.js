const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const discountSchema = mongoose.Schema({
    discount_id: {
        type: String,
        required: [true, "Discount ID is required."]
    },
    name: {
        type: String,
        required: [true, "Discount name is required."]
    },
    description: {
        type: String
    },
    discount_percent: {
        type: Number,
        default: 0
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    discount_upto_amount: {
        type: Number,
        default: 0
    },
    discount_code: {
        type: String,
        required: [true, "Discount code is required."]
    },
    service: {
        type: String,
        default: 'Hire Car Cleaner'
    }
})


const Discount = mongoose.model(CONSTANT.MODEL.DISCOUNT, discountSchema)

module.exports = Discount




