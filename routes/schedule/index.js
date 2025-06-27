const express = require('express')
const router = express.Router()
const { STATUS_CODE, getStatusString } = require('../../utility/status')
const { validationResult, matchedData } = require('express-validator')
const Schedule = require('../../models/schedule/schedule.model')
const Subscription = require('./../../models/subscription/subscription.model')
const { isValidObjectId } = require('../../utility/common_api_functions')
const { scheduleStatusBodyValidators } = require("./validators")


router.get("/", async (req, res) => {
    try {
        const data = await Schedule.find().populate('subscription').exec()
        return res.status(STATUS_CODE.OK).json({
            msg: 'All Schedule data.',
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
}).get("/:id", async (req, res) => {
    const schedule_id = req.params.id
    if(!isValidObjectId(schedule_id)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: "field",
                param: 'schedule_id',
                msg: 'Invalid schedule id.',
                location: 'query',
                value: schedule_id,
            }]
        })
    }
    
    try {
        const exists = await Schedule.exists({_id: schedule_id})
        if(!isValidObjectId(schedule_id)){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    param: 'schedule_id',
                    msg: 'Schedule does not exist.',
                    location: 'query',
                    value: schedule_id,
                }]
            })
        }
        const data = await Schedule.find({_id: schedule_id}).populate({
            path: 'subscription',
            populate: ['customer', 'car', 'cluster']
        }).exec()
        data[0].dates.sort((a, b) => a.date - b.date)
        return res.status(STATUS_CODE.OK).json({
            msg: 'All Schedule data.',
            // data: [{...data[0], dates: [...data[0].dates.sort((a, b) => a.date - b.date)]}],
            data: data,
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
}).post("/status", scheduleStatusBodyValidators(), async (req, res) => {
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
        const bodyData = matchedData(req)
        const updated = await Schedule.updateOne({_id: bodyData.schedule, "dates.date": bodyData.date}, {$set: {"dates.$.status": bodyData.status}}, {new: true})
        console.log(updated)
        return res.status(STATUS_CODE.OK).json({
            msg: "Cleaning status updated.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: [{msg: "Cleaning status updated."}]
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
})
// .post("/", postBodyValidators(), async (req, res) => {
    
//     // const result = validationResult(req)
//     // if(!result.isEmpty()){
//     //     return res.status(STATUS_CODE.BAD_REQUEST).json({
//     //         msg: getStatusString(STATUS_CODE.BAD_REQUEST),
//     //         statusCode: STATUS_CODE.BAD_REQUEST,
//     //         success: false,
//     //         errors: result.array()
//     //     })
//     // }

//     // const matchedBodyData = matchedData(req)
    
//     // try {
        
//     //     const subscriptionExists = await Subscription.exists({_id: matchedBodyData.subscription})
//     //     if(!subscriptionExists){
//     //         return res.status(STATUS_CODE.BAD_REQUEST).json({
//     //             msg: getStatusString(STATUS_CODE.BAD_REQUEST),
//     //             statusCode: STATUS_CODE.BAD_REQUEST,
//     //             success: false,
//     //             errors: [{
//     //                 type: "field",
//     //                 location: "body",
//     //                 param: "subscription",
//     //                 value: matchedBodyData.subscription,
//     //                 msg: `Subscription does not exist with ID ${matchedBodyData.subscription}`
//     //             }]
//     //         })
//     //     }

        

//     // } catch (error) {
//     //     return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//     //         msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
//     //         statusCode: STATUS_CODE.OK,
//     //         success: false,
//     //         errors: []
//     //     })
//     // }
// }).put("/:id", async (req, res) => {
//     try {
        
//     } catch (error) {
//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//             msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
//             statusCode: STATUS_CODE.OK,
//             success: false,
//             errors: []
//         })
//     }
// }).delete("/:id", async (req, res) => {
//     try {
        
//     } catch (error) {
//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//             msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
//             statusCode: STATUS_CODE.OK,
//             success: false,
//             errors: []
//         })
//     }
// })

module.exports = router