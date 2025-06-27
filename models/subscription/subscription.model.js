const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants')

const subscriptionSchema = mongoose.Schema({
    subscription_id: {
        type: String,
        required: [true, "Subscription ID is required."],
        unique: true,
    },
    start_date: {
        type: String
    },
    end_date: {
        type: String
    },
    package: {
        _id: {
            type: String,
            required: [true, "Package ID is required."],
        },
        package_id: {
            type: String,
            required: [true, "Package ID is required."],
        },
        package_name: {
            type: String,
        }
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CUSTOMER,
        required: [true, "Subscriber data is required."],
    },
    active_status: {
        type: String,
        default: "Active",
        enum: ["Active", "Complete", "Upcoming"]
    },
    price: {
        type: Number,
        required: [true, "Subscription Price is required."]
    },
    interior_cleaning: {
        type: Number,
        required: [true, "Number of interior cleanings is required."]
    },
    exterior_cleaning: {
        type: Number,
        required: [true, "Number of exterior cleanings is required."]
    },
    number_of_days: {
        type: Number,
        required: [true, "Number of days is required."]
    },
    taxes: [{
        name: {
            type: String,
            required: [true, "Tax Name is required."]
        },
        tax_value: {
            type: Number,
            required: [true, "Tax value is required."]
        }
    }],
    discount: [{
        name: {
            type: String
        },
        description: {
            type: String
        },
        amount: {
            type: Number
        }
    }],
    cleaner: {
        type: mongoose.Schema.Types.ObjectId
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CLUSTER.CLUSTER,
        required: [true, "Cluster data is required."]
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.SCHEDULE
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CUSTOMER_CAR,
        required: [true, 'Customer Car data is required.']
    },
    cleaning_balance_report: [{
        start_date: {
            type: String,
            required: [true, "Start date is required."],
            default: null
        },
        end_date: {
            type: String,
            required: [true, "End date is required."],
            default: null
        },
        promised_external_cleanings: {
            type: Number,
            default: 0
        },
        promised_internal_cleanings: {
            type: Number,
            default: 0
        },
        completed_external_cleanings: {
            type: Number,
            default: 0
        },
        completed_internal_cleanings: {
            type: Number,
            default: 0
        },
        internal_cleanings_balance: {
            type: Number,
            default: 0
        },
        external_cleanings_balance: {
            type: Number,
            default: 0
        },
        adjusted_internal_cleanings: {
            type: Number,
            default: 0
        },
        adjusted_external_cleanings: {
            type: Number,
            default: 0
        },
        all_settled: {
            type: Boolean,
            default: false
        }
    }],
    cost_per_external_cleaning: {
        type: Number,
        default: 0
    },
    cost_per_internal_cleaning: {
        type: Number,
        default: 0
    }
})

const Subscription = mongoose.model(CONSTANT.MODEL.SUBSCRIPTION, subscriptionSchema)

module.exports = Subscription
