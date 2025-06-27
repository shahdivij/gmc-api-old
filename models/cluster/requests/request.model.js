const mongoose = require('mongoose')
const CONSTANTS = require('../../../utility/constants')

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


const requestSchema = mongoose.Schema({
    cluster_db_id: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true
    },
    cluster_id: {
        type: String,
        trim: true
    },
    cluster_name: {
        type: String,
        trim: true
    },
    requester_name: {
        type: String,
        required: [true, "Requester name is required."],
        trim: true
    },
    mobile_number: {
        type: String,
        required: [true, "Requester mobile number is required."],
        trim: true,
    },
    residence_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Residence_Type',
        required: [true, "Cluster residence type is required."]
    },
    requester_role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requester_Role',
        required: [true, "Requestor Role is required."]
    },
    address: {
        type:  clusterAddressSchema,
        required: [true, "Car Cluster Address is required."]
    },
    request_id: {
        type: String,
        required: [true, "Cluster Request ID is required."],
        unique: true
    },
    comment: {
        type: String,
        trim: true
    },
    cluster_picture: {
        type: clusterPictureSchema,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const ClusterRequest = mongoose.model(CONSTANTS.MODEL.CLUSTER.REQUEST, requestSchema)

module.exports = ClusterRequest