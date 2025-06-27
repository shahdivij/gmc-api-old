const express = require('express')
const { isValidObjectId } = require('../../../utility/common_api_functions')
const Cluster = require('../../../models/cluster/cluster.model')
const { body, validationResult, matchedData } = require('express-validator')
const { STATUS_CODE } = require('./../../../utility/status')
const { default: mongoose } = require('mongoose')

const router = express.Router()

const bodyValidators = () => {
    return [
        body('car_category').notEmpty().custom(value => {
            if(!isValidObjectId(value)) throw new Error("Invalid Car Category ID " + value)
            else return true
        }),
        body('ext_cleaning_rate').notEmpty().custom(value => {
            if(value == 0 || value < 0) throw new Error("Exterior Cleaning rate should be more than zero.")
            else return true
        }),
        body('int_cleaning_rate').notEmpty().custom(value => {
            if(value == 0 || value < 0) throw new Error("Interior Cleaning rate should be more than zero.")
            else return true
        }),
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

const validateRateListId = async (req, res, next) => {
    const rate_list_id = req.params.rate_list_id
    if(!isValidObjectId(rate_list_id)){
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [{
                "type": "field",
                "value": rate_list_id,
                "msg": "Rate List ID is invalid..",
                "path": "rate_list_id",
                "location": "params"
            }]
        })
    }

    next()
}

router.get("/", async (req, res) => {
    const cluster_id = req.params.cluster_id
    try {
        const data = await Cluster.find({ _id: cluster_id }).populate({
            path: 'cleaner_rate_list',
            populate: 'car_category'
        }).exec()

        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: data && data[0] && data[0].cleaner_rate_list || [],
            msg: "Cleaner Rate List data."
        })

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error.",
        })
    }
    
}).get("/:category_id", async (req, res) => {
    const cluster_id = req.params.cluster_id
    const category_id = req.params.category_id
    try {
        const data = await Cluster.find({ _id: cluster_id }).populate({
            path: 'cleaner_rate_list',
            populate: 'car_category'
        }).exec()

        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: data && data[0] && data[0].cleaner_rate_list.filter(item => item.car_category._id == category_id) || [],
            msg: "Cleaner Rate List data."
        })

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error.",
        })
    }
    
}).post("/", bodyValidators(), validateBody, async (req, res) => {
    const cluster_id = req.cluster_id
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const data = matchedData(req)
        
        const existsCluster = await Cluster.findById(cluster_id).exec()

        if(!existsCluster){
            return res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                statusCode: STATUS_CODE.NOT_FOUND,
                msg: "Cluster does not exist with given Cluster ID.",
                errors: []
            })
        }

        let exists = false
        if(existsCluster){
            const found = existsCluster.cleaner_rate_list && existsCluster.cleaner_rate_list.filter(item => item.car_category == data.car_category )
            exists = found && found.length > 0
        }

        if(exists){
            return res.status(STATUS_CODE.ALREADY_EXIST).json({
                success: false,
                statusCode: STATUS_CODE.ALREADY_EXIST,
                msg: "Rate list already exists for given car category.",
                errors: []
            })
        }

        await Cluster.findOneAndUpdate({_id: cluster_id}, {$push: {cleaner_rate_list: data}})

        session.commitTransaction()

        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: data,
            msg: "Rate list for given car category added."
        })

    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error.",
        })
    }
}).put("/:rate_list_id", bodyValidators(), validateBody, async (req, res) => {
    const session = await mongoose.startSession()

    try {

        session.startTransaction()

        const rate_list_id = req.params.rate_list_id
    
        const cluster_data = await Cluster.findById(req.cluster_id)

        if(!cluster_data){
            return res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                statusCode: STATUS_CODE.NOT_FOUND,
                msg: "Cluster does not exist with given Cluster ID.",
                errors: []
            })
        }

        const bodyData = matchedData(req)
    
        cluster_data.cleaner_rate_list = cluster_data.cleaner_rate_list.filter(rate_list => rate_list._id != rate_list_id)
        cluster_data.cleaner_rate_list.push({
            car_category: bodyData.car_category,
            ext_cleaning_rate: bodyData.ext_cleaning_rate,
            int_cleaning_rate: bodyData.int_cleaning_rate,
            _id: rate_list_id
        })

        await cluster_data.save({session: session})
    
        session.commitTransaction()

        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: [matchedData],
            msg: "Rate list updated."
        })
    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error.",
        })
    }
}).delete("/:rate_list_id", validateRateListId, async (req, res) => {
    
    const session = await mongoose.startSession()

    try {

        session.startTransaction()

        const existsCluster = await Cluster.findById(req.cluster_id).exec()

        if(!existsCluster){
            return res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                statusCode: STATUS_CODE.NOT_FOUND,
                msg: "Cluster does not exist with given Cluster ID.",
                errors: []
            })
        }

        const rate_list_id = req.params.rate_list_id
    
        const cluster_data = await Cluster.findById(req.cluster_id)
    
        cluster_data.cleaner_rate_list = cluster_data.cleaner_rate_list.filter(rate_list => rate_list._id != rate_list_id)
    
        await cluster_data.save({session: session})
    
        session.commitTransaction()

        return res.status(200).json({
            success: true, 
            statusCode: 200,
            data: [],
            msg: "Rate list deleted."
        })
    } catch (error) {
        session.abortTransaction()
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            msg: "Internal Server Error.",
        })
    }

})

module.exports = router