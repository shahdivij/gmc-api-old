const express = require('express')
const { STATUS_CODE, getStatusString } = require("./../../../../utility/status")
const ChangeAddressRequest = require("./../../../../models/customer/address_change_request/change_add_req.model")
const { body, validationResult, matchedData, param } = require('express-validator')
const { isValidObjectId, getNextSequence } = require("./../../../../utility/common_api_functions")
const Customer = require("./../../../../models/customer/customer.model")
const { default: mongoose } = require('mongoose')
const CONSTANT = require("./../../../../utility/constants") 

const router = express.Router()


const bodyValidators = () => {
    return [
        body("customer").trim().custom(async value => {
            if(!value) throw new Error("Customer ID is required.")
            if(!isValidObjectId(value) ) throw new Error("Customer ID is not valid.")
            const exists = await Customer.exists({_id: value})
            if(!exists) throw new Error("Customer does not exist.")
        }),
        body("address_to_change").trim().custom(async value => {
            if(!value) throw new Error("Address ID is required.")
            if(!isValidObjectId(value) ) throw new Error("Address ID is not valid.")
            const exists = await Customer.exists({"addresses._id": value})
            if(!exists) throw new Error("Address does not exist.")
        }),
        body("comment").trim().optional()
    ]
}

const queryValidators = () => {
    return [
        param("id").trim().custom(async value => {
            if(!value) throw new Error("Address Change Request ID is required.")
            if(!isValidObjectId(value) ) throw new Error("Address Change Request is not valid.")
            const exists = await ChangeAddressRequest.exists({_id: value})
            if(!exists) throw new Error("Address Change Request does not exist.")
        })
    ]
}


router.get("/", async (req, res) => {
    try {
        const data = await ChangeAddressRequest.find().populate("address_to_change").populate("customer").exec()
        console.log(data)
        return res.status(STATUS_CODE.OK).json({
            msg: 'Address Change Request data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
}).get("/:id", queryValidators(), async (req, res) => {
    const id = req.params.id
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }
    try {
        const data = await ChangeAddressRequest.find({_id: id})
        return res.status(STATUS_CODE.OK).json({
            msg: 'Address Change Request data.',
            data: data,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
            errors: []
        })
    }
}).post("/", bodyValidators(), async (req, res) => {
    const result = validationResult(req)
    console.log(result)
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }
    const matchedBodyData = matchedData(req)

    const session = await mongoose.startSession()

    try {

        session.startTransaction()

        const exists = await ChangeAddressRequest.exists({address_to_change: matchedBodyData.address_to_change, status: {$in: ["OPEN", "IN_PROGRESS"]}})
        console.log(exists)
        if(exists){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: "Change request is already in open or in-progress status for this address. Can not add another request.",
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: null
            })
        }

        const id = await getNextSequence(CONSTANT.MODEL.CHANGE_ADDRESS_REQUEST, session)

        const change_request = new ChangeAddressRequest({
            request_id: id,
            customer: matchedBodyData.customer,
            address_to_change: matchedBodyData.address_to_change
        })

        const saved = await change_request.save()

        session.commitTransaction()
        
        return res.status(STATUS_CODE.OK).json({
            msg: 'Address Change request is added successfully.',
            data: saved,
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        session.abortTransaction()
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
}).put("/:id", queryValidators(), async (req, res) => {
    try {
        
        return res.status(STATUS_CODE.OK).json({
            msg: '',
            data: [],
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
}).delete("/:id", queryValidators(), async (req, res) => {
    try {
        
        return res.status(STATUS_CODE.OK).json({
            msg: '',
            data: [],
            statusCode: STATUS_CODE.OK,
            success: true
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.OK,
            success: false,
            errors: []
        })
    }
})

module.exports = router