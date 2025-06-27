const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const customerAddressSchema = mongoose.Schema({
    other_name: {
        type: String,
        trim: true,
        default: null
    },
    address_type: {
        type: String,
        required: [true, "Address Type is required."],
        enum: ["HOME", "OFFICE", "OTHER"],
        uppercase: true,
    },
    house_flat_no: {
        type: String,
        required: [true, "Address is required."],
        default: null
    },
    line_1: {
        type: String,
        required: [true, "Address Line 1 is required."]
    },
    line_2: {
        type: String,
    },
    area: {
        type: String,
        required: [true, "Area is required."]
    },
    city: {
        type: String,
        required: [true, "City is required."]
    },
    state: {
        type: String,
        required: [true, "State is required."]
    },
    country: {
        type: String,
        default: "INDIA"
    },
    zip_code: {
        type: Number,
        required: [true, "Zip code is required."]
    },
    locked: {
        type: Boolean,
        default: false
    },
    cluster_id: {
        type: String,
        default: null
    },
    cluster_db_id: {
        type: String,
        default: null
    },
    cluster_name: {
        type: String,
        default: null
    }
})

const customerPictureSchema = mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        trim: true
    },
    image_data: {
        type: String,
        trim: true
    }
})

const customerSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Customer name is required."]
    },
    mobile_number: {
        type: Number,
        unique: true,
        required: [true, "Mobile number is required."]
    },
    email: {
        type: String,
        default: null
    },
    customer_id: {
        type: String,
        required: [true, "Customer Id is required."],
        unique: true
    },
    role: {
        type: String,
        required: [true, "Role is required."]
    },
    addresses: [{
        type:  customerAddressSchema,
    }],
    profile_picture: {
        type: customerPictureSchema,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CUSTOMER_CAR,
    }],
    demo_package_taken: {
        type: Boolean,
        default: false
    },
    archive: {
        type: Boolean,
        default: false
    },
    first_subscription_taken: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const Customer = mongoose.model(CONSTANT.MODEL.CUSTOMER, customerSchema)

module.exports = Customer