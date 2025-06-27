const mongoose = require('mongoose')
const CONSTANT = require('./../../utility/constants')

const pictureSchema = mongoose.Schema({
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

const customerCarSchema = mongoose.Schema({
    car_id: {
        type: String,
        required: [true, "Customer Car ID is required."]
    },
    fuel_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fuel_Type',
        required: [true, "Car Fuel Type is required."]
    },
    registration_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration_Type',
        required: [true, "Car Registration Type is required."]
    },
    transmission_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transmission_Type',
        required: [true, "Car Transmission Type is required."]
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car_Model',
        required: [true, "Car Model is required."]
    },
    subscription: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.SUBSCRIPTION,
        default: null
    }],
    uploaded_model_picture: {
        type: pictureSchema,
        default: null
    },
    registration_number: {
        type: String,
        required: [true, "Car Registration Number is required."],
        unique: true,
        uppercase: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.CUSTOMER,
        required: [true, "Customer ID is required."]
    },
    parking_lot_number: {
        type: String,
        default: null
    },
    house_flat_no: {
        type: String,
        default: null
    },
    qr_code: {
        qr_code_id: {
            type: String,
            default: null
        },
        series_id: {
            type: String,
            default: null
        },
        data: {
            image_data: {
                type: String,
                default: null
            },
            generated_at: {
                type: mongoose.Schema.Types.Date,
            }
        }
    },
    cleaning_balance: {
        external_cleanings: {
            type: Number,
            default: 0
        },
        internal_cleanings: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            default: 0
        },
        look_up_date: {
            type: String,
            default: null
        }
    },
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const CustomerCar = mongoose.model(CONSTANT.MODEL.CUSTOMER_CAR, customerCarSchema)

module.exports = CustomerCar