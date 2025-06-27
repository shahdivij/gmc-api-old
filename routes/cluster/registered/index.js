const express = require('express')
const router = express.Router()
const Cluster = require('./../../../models/cluster/cluster.model')
const {
    isValidObjectId,
    getNextSequence,
    decrementSequence
} = require('../../../utility/common_api_functions')
const CONSTANT = require('../../../utility/constants')

const { body, validationResult, matchedData } = require('express-validator')
const IDs = require('../../../models/ids/ids.model')
const { default: mongoose } = require('mongoose')
const QRCodeSeries = require('./../../../models/qrcodeseries/qrcodeseries.model')
const registeredRoutTimeSlotHandler = require('./time_slot');
const validators = () => {
    return [
        body("name").trim().notEmpty().withMessage("Cluster Name is required."),
        body("approved").trim().optional(),
        body("packages").optional().isArray(),
        body("residence_type").trim().notEmpty().withMessage("Residence Type ID is required."),
        body("address.line_1").trim().notEmpty().withMessage("Cluster Address Line 1 is required"),
        body("address.area").trim().notEmpty().withMessage("Cluster Address Area is required"),
        body("address.city").trim().notEmpty().withMessage("Cluster Address City is required"),
        body("address.state").trim().notEmpty().withMessage("Cluster Address State is required"),
        body("address.country").trim().notEmpty().withMessage("Cluster Address Country is required"),
        body("address.zip_code").trim().notEmpty().withMessage("Cluster Address Zip Code is required"),
        body("geo_location").notEmpty().withMessage("Goe location is required."),
        body("geo_location.longitude").notEmpty().withMessage("Goe location longitude is required."),
        body("geo_location.latitude").notEmpty().withMessage("Goe location latitude is required."),
        body("off_days.day").optional().custom(async value => {
            if (value && !["NONE", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].includes(value)) {
                throw new Error(`Off Day should be one of these: ["NONE", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]`)
            }
        }),
    ]
}

const validateBody = async (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        next()
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [...errors['errors']]
        })
    }
}

const validateObjectID = async (req, res, next) => {
    const residenceTypeID = req.body.residence_type
    if (isValidObjectId(residenceTypeID)) {
        next()
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [{
                "type": "field",
                "value": residenceTypeID,
                "msg": "Residence Type ID is invalid..",
                "path": "residence_type",
                "location": "body"
            }]
        })
    }
}

router.get("/", async (req, res) => {
    try {
        const cluster = await Cluster.find().populate('residence_type').populate('qr_code_series').populate('cleaner_rate_list.car_category').populate('time_slot').exec()
        return res.status(200).json({
            success: true,
            statusCode: 200,
            data: cluster,
            msg: "Car Cluster data."
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        })
    }
}).get("/:id", async (req, res) => {

    const cluster_id = req.params.id
    if (isValidObjectId(cluster_id)) {
        try {
            const cluster = await Cluster.find({ _id: cluster_id }).populate('residence_type').populate('packages').populate('cleaner_rate_list.car_category').populate('time_slot').exec()
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: cluster,
                msg: "Car Cluster data."
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                data: null,
                msg: "Internal Server Error."
            })
        }
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [{
                "type": "field",
                "value": residenceTypeID,
                "msg": "Residence Type ID is invalid..",
                "path": "residence_type",
                "location": "body"
            }]
        })
    }

}).post("/", validators(), validateBody, validateObjectID, async (req, res) => {

    let clusterName = req.body.name.trim().toLowerCase()
    clusterName = clusterName[0].toUpperCase() + clusterName.slice(1)
    const currentIdsData = await IDs.find()
    const clusterID = currentIdsData[0].Cluster

    console.log(matchedData(req))

    try {
        const exist = await Cluster.exists({ name: clusterName })
        if (exist) {
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Duplicate Entry.",
                errors: [{
                    "type": "field",
                    "value": clusterName,
                    "msg": "Cluster already exists with given name. Can not add duplicate entry.",
                    "path": "name",
                    "location": "body"
                }]
            })
        }

        const cluster_id = await getNextSequence(CONSTANT.MODEL.CLUSTER.CLUSTER)

        const newCluster = new Cluster({
            ...req.body,
            cluster_id,
        })

        const result = await newCluster.save()

        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "New Cluster added successfully.",
            data: [result]
        });
    } catch (error) {
        console.log(error);
        const currentIdsData_ = await IDs.find();
        const clusterID_ = currentIdsData_[0].Cluster
        if (clusterID < clusterID_)
            await decrementSequence(CONSTANT.MODEL.CLUSTER.CLUSTER)
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not add car cluster.",
        });
    }

}).delete("/:id", async (req, res) => {
    const clusterID = req.params.id
    if (!isValidObjectId(clusterID)) {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Invalid Cluster ID",
            errors: [{
                "type": "params",
                "value": clusterID,
                "msg": "Invalid Cluster ID",
                "path": "id",
                "location": "params"
            }]
        });
    }

    try {
        const exists = await Cluster.exists({ _id: clusterID })
        if (!exists) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                data: null,
                msg: "Car Cluster does not exist with cluster ID " + clusterID,
            });
        }

        const result = await Cluster.findOneAndDelete({ _id: clusterID })

        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: result,
            msg: "Car Cluster deleted successfully with cluster ID " + clusterID,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not delete car cluster."
        });
    }
}).put("/:id", async (req, res) => {
    const clusterID = req.params.id
    const clusterData = req.body
    if (!clusterData && !Object.keys(clusterData).length) {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            msg: "Bad request.",
        });
    }

    const residenceTypeID = clusterData.residence_type

    if (!isValidObjectId(clusterID)) {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            msg: "Invalid Cluster ID.",
        });
    }

    if (!isValidObjectId(residenceTypeID)) {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            msg: "Invalid Residence type.",
        });
    }

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const exist = await Cluster.exists({ _id: clusterID })
        if (!exist) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                data: null,
                msg: "Car Cluster does not exist with cluster ID " + clusterID,
            });
        }

        const currentData = await Cluster.find({ _id: clusterID })
        const updatedQRCodeData = await QRCodeSeries.findByIdAndUpdate(currentData[0].qr_code_series, { cluster: null }).session(session)
        const result = await Cluster.findByIdAndUpdate(clusterID, { ...clusterData }, { new: true }).session(session)
        const newQRCodeData = await QRCodeSeries.findByIdAndUpdate(result.qr_code_series, { cluster: result._id }).session(session)
        session.commitTransaction()
        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: result,
            msg: "Car Cluster updated successfully.",
        });
    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not update car Cluster.",
        });
    }

})

// time slot routes
router.use("/:cluster_id/time_slot", registeredRoutTimeSlotHandler)


module.exports = router;