const express = require('express')
const router = express.Router()
const { isValidObjectId } = require('./../../utility/common_api_functions')

const registeredRoutHandler = require('./registered')
const residenceRoutHandler = require('./residence')
const requestRoutHandler = require('./requests')
const packageRoutHandler = require('./package');
const timeslotRoutHandler = require('./time_slot')


const cleanerRateListRoutHandler = require('./cleaner_rate_list')

const validateClusterIdParam = async (req, res, next) => {
    const cluster_id = req.params.cluster_id
    req.cluster_id = cluster_id
    if(!isValidObjectId(cluster_id)){
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [{
                "type": "field",
                "value": cluster_id,
                "msg": "Cluster ID is invalid..",
                "path": "cluster_id",
                "location": "params"
            }]
        })
    }

    next()
}

router.use("/registered", registeredRoutHandler)
router.use("/residence", residenceRoutHandler)
router.use("/request", requestRoutHandler)
router.use("/package", packageRoutHandler)
router.use("/timeslot", timeslotRoutHandler)
router.use("/:cluster_id/cleanerratelist", validateClusterIdParam, cleanerRateListRoutHandler)

module.exports = router