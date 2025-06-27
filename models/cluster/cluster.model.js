const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants')

const geoLocationSchema = mongoose.Schema({
    longitude: {
        type: Number,
        required: [true, "Longitude is required."]
    },
    latitude: {
        type: Number,
        required: [true, "Latitude is required."]
    }
})

const clusterAddressSchema = mongoose.Schema({
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

const clusterPictureSchema = mongoose.Schema({
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

const clusterSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Car Cluster name is required."],
        unique: true,
        trim: true
    },
    cluster_id: {
        type: String,
        required: [true, "Cluster ID is required."],
        unique: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    address: {
        type: clusterAddressSchema,
        required: [true, "Car Cluster Address is required."]
    },
    residence_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Residence_Type',
        required: [true, "Cluster residence type is required."]
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    cluster_picture: {
        type: clusterPictureSchema,
        required: true
    },
    qr_code_series: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: CONSTANT.MODEL.QRCODE_SERIES
    },
    geo_location: {
        type: geoLocationSchema,
        required: [true, "Geo Location of cluster is required."]
    },
    packages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.PACKAGE
    }],
    off_days: [{
        type: String,
        enum: ["NONE", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        default: "NONE"
    }],
    approved: {
        type: Boolean,
        default: false
    },
    time_slot: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: CONSTANT.MODEL.TIME_SLOT
    }],
    cleaner_rate_list: [{
        car_category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: CONSTANT.MODEL.CAR.CATEGORY,
            required: [true, "Car Category is required."]
        },
        ext_cleaning_rate: {
            type: Number,
        },
        int_cleaning_rate: {
            type: Number
        }
    }]
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    })

const Cluster = mongoose.model(CONSTANT.MODEL.CLUSTER.CLUSTER, clusterSchema)

module.exports = Cluster

