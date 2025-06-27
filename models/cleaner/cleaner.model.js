const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')


const cleanerAddressSchema = mongoose.Schema({
    line_1: {
        type: String,
        required: [true, "Address is required."]
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
        default: "India"
    },
    zip_code: {
        type: Number,
        required: [true, "Zip code is required."]
    }
})

const cleanerPictureSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Image name is required."],
        lowercase: true,
        trim: true
    },
    image_data: {
        type: String,
        required: [true, "Image data is required."]
    }
})

const cleanerSchema = mongoose.Schema({
    cleaner_id: {
        type: String,
        required: [true, "Cleaner ID is required."]
    },
    fisrtname: {
        type: String,
        required: [true, "Cleaner fist name is required."]
    },
    middlename: {
        type: String,
    },
    lastname: {
        type: String,
        required: [true, "Cleaner last name is required."]
    },
    mobile_number: {
        type: String,
        required: [true, "Cleaner mobile number is required."]
    },
    is_approved: {
        type: Boolean,
        default: false,
        required: [true, "Cleaner approval status is required."]
    },
    profile_picture: {
        type: cleanerPictureSchema
    },
    address: {
        type: cleanerAddressSchema,
        required: [true, "Cleaner address is required."]
    },
    earnings: {
        total_amount: {
            type: Number,
            default: 0,
            required: [true, "Cleaner earning total amount is required."]
        },
        total_amount_paid: {
            type: Number,
            default: 0,
            required: [true, "Cleaner total paid amount is required."]
        },
        remaining_amount: {
            type: Number,
            default: 0,
            required: [true, "Cleaner total remaining amount is required."]
        }
    },
    work_details: {
        exterior_cleanings: {
            type: Number,
            default: 0,
            required: [true, "Number of Exterior cleanings is required."]
        },
        interior_cleanings: {
            default: 0,
            type: Number,
            required: [true, "Number of Interior cleanings is required."]
        }
    }
})

const Cleaner = mongoose.model(CONSTANT.MODEL.CLEANER, cleanerSchema)

module.exports = Cleaner