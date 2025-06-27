const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants')

const packageSchema = mongoose.Schema({
    package_id: {
        type: String,
        required: [true, "Package ID is required."],
        unique: true,
    },
    name: {
        type: String,
        required: [true, "Package name is required."],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: null,
        trim: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    number_of_days: {
        type: Number,
        required: [true, "Number of days is required."]
    },
    prices: [{
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: CONSTANT.MODEL.CAR.CATEGORY,
            required: [true, "Category is required."]
        },
        strikethrough_price: {
            type: Number,
            default: null
        },
        actual_price: {
            type: Number,
            required: [true, "Actual Price is required."]
        },
        discount: {
            name: {
                type: String
            },
            description: {
                type: String
            },
            amount: {
                type: Number
            }
        },
        int_refund_price: {
            type: Number
        },
        ext_refund_price: {
            type: Number
        }
    }],
    interior_cleaning: {
        type: Number,
        required: [true, "Number of interior cleanings is required."]
    },
    exterior_cleaning: {
        type: Number,
        required: [true, "Number of exterior cleanings is required."]
    },
    taxes: [{
        name: {
            type: String,
            required: [true, "Tax Name is required."]
        },
        value: {
            type: Number,
            required: [true, "Tax value is required."],
            default: 0
        }
    }],
    package_type: {
        type: String,
        enum: ['DEMO', 'REGULAR'],
        default: 'REGULAR'
    },
    renew_alert: {
        type: Number,
        default: 80
    },
    clusters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CLUSTER.CLUSTER,   
    }],
    _2nd_car_onward_off: {
        type: Number,
        default: 0,
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const Package = mongoose.model(CONSTANT.MODEL.PACKAGE, packageSchema)

module.exports = Package
