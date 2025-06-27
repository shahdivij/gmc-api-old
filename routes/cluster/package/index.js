const express = require('express')
const router = express.Router()
const Cluster = require('./../../../models/cluster/cluster.model')
const {
    isValidObjectId,
    getNextSequence,
    decrementSequence
} = require('../../../utility/common_api_functions')
const CONSTANT = require('../../../utility/constants')

const { body, validationResult } = require('express-validator')
const IDs = require('../../../models/ids/ids.model')
const { default: mongoose } = require('mongoose')
const QRCodeSeries = require('./../../../models/qrcodeseries/qrcodeseries.model')
const Package = require('./../../../models/package/package.model')

const validators = () => {
    return [
        body("cluster").trim().notEmpty().withMessage("Cluster ID is required."), 
        body("package").trim().notEmpty().withMessage("Package ID is required."),
    ]
}

const validateBody = async (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()) {
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
    const clusterID = req.body.cluster
    const packageID = req.body.package
    if(isValidObjectId(clusterID)) {
        if(isValidObjectId(packageID)) {
            next()
        } else {
            return res.status(400).json({
                success: "false",
                statusCode: 400,
                msg: "Bad request.",
                errors: [{
                    "type": "field",
                    "value": packageID,
                    "msg": "Package ID is invalid..",
                    "path": "package",
                    "location": "body"
                }]
            })
        }
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [{
                "type": "field",
                "value": clusterID,
                "msg": "Cluster ID is invalid..",
                "path": "cluster",
                "location": "body"
            }]
        })
    }
}

router.get("/:cluster_id", async (req, res) => {
    const cluster_id = req.params.cluster_id
    try {
        const packages = await Cluster.find({_id: cluster_id}, 'packages').populate('packages').exec()
        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: packages,
            msg: "Cluster packages"
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
    return res.status(500).json({
        success: false, 
        statusCode: 500,
        data: null,
        msg: "Not Implemented"
    })
}).post("/", validators(), validateBody, validateObjectID, async (req, res) => {

    const clusterID = req.body.cluster
    const packageID = req.body.package

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const clusterExist = await Cluster.exists({_id: clusterID})
        if(!clusterExist){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Cluster does not exist.",
                errors: [{
                    "type": "field",
                    "value": clusterID,
                    "msg": "Cluster does not exist with cluster id: " + clusterID,
                    "path": "cluster",
                    "location": "body"
                }]
            })
        }

        const packageExist = await Package.exists({_id: packageID})
        if(!packageExist){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Package does not exist.",
                errors: [{
                    "type": "field",
                    "value": packageID,
                    "msg": "Package does not exist with package id: " + packageID,
                    "path": "package",
                    "location": "body"
                }]
            })
        }

        await Cluster.findByIdAndUpdate(clusterID, {$push: { packages: packageID } }, {session: session})
        await Package.findByIdAndUpdate(packageID, {$push: { clusters: clusterID } }, {session: session})

        session.commitTransaction()
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "New Package assigned to cluster successfully.",
            data: []
        });
    } catch (error) {
        session.abortTransaction()
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not assign package to cluster.",
        });
    }

}).delete("/", validators(), validateBody, validateObjectID, async (req, res) => {
    const clusterID = req.body.cluster
    const packageID = req.body.package

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const clusterExist = await Cluster.exists({_id: clusterID})
        if(!clusterExist){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Cluster does not exist.",
                errors: [{
                    "type": "field",
                    "value": clusterID,
                    "msg": "Cluster does not exist with cluster id: " + clusterID,
                    "path": "cluster",
                    "location": "body"
                }]
            })
        }

        const packageExist = await Package.exists({_id: packageID})
        if(!packageExist){
            return res.status(409).json({
                success: "false",
                statusCode: 409,
                msg: "Package does not exist.",
                errors: [{
                    "type": "field",
                    "value": packageID,
                    "msg": "Package does not exist with package id: " + packageID,
                    "path": "package",
                    "location": "body"
                }]
            })
        }

        await Cluster.findByIdAndUpdate(clusterID, {$pull: { packages: packageID } }, {session: session})
        await Package.findByIdAndUpdate(packageID, {$pull: { clusters: clusterID } }, {session: session})

        session.commitTransaction()
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "New Package assigned to cluster successfully.",
            data: [result]
        });
    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error. Could not assign package to cluster.",
        });
    }
})

module.exports = router;