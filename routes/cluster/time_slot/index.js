const express = require('express');
const { STATUS_CODE, getStatusString } = require('../../../utility/status');
const TimeSlot = require('../../../models/time_slot/time_slot.model');
const { bodyValidators, validateBody, slotIdParamValidator } = require('./validators');
const { matchedData } = require('express-validator');

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const data = await TimeSlot.find()
        return res.status(STATUS_CODE.OK).send({
            data: data,
            success: true, 
            msg: "Time Slot data.",
            statsCode: STATUS_CODE.OK
        })
    } catch (error) {
        res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        });
    }
}).post("/", bodyValidators(), validateBody, async (req, res) => {
    try {
        const data = matchedData(req)
        const exist = await TimeSlot.exists({
            'start_time.hour': data.start_time.hour, 
            'start_time.minute': data.start_time.minute, 
            'start_time.ampm': data.start_time.ampm,
            'end_time.hour': data.end_time.hour, 
            'end_time.minute': data.end_time.minute, 
            'end_time.ampm': data.end_time.ampm
        })

        if(exist){
            return res.status(STATUS_CODE.ALREADY_EXIST).json({
                success: false,
                statusCode: STATUS_CODE.ALREADY_EXIST,
                msg: "Time slot with this time already exists.",
            })
        }

        const timeSlot = new TimeSlot({
            start_time: {
                hour: data.start_time.hour,
                minute: data.start_time.minute,
                ampm: data.start_time.ampm,
            },
            end_time: {
                hour: data.end_time.hour,
                minute: data.end_time.minute,
                ampm: data.end_time.ampm,
            },
            visible: data.visible == undefined || data.visible == null ? false : data.visible
        })

        const saved = await timeSlot.save()

        return res.status(STATUS_CODE.CREATED).json({
            success: true,
            statusCode: STATUS_CODE.CREATED,
            msg: "New Time slot added successfully.",
            data: [saved]
        })


    } catch (error) {
        res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        });
    }
}).put("/:slot_id", slotIdParamValidator(), bodyValidators(), validateBody, async (req, res) => {
    try {
        const slot_id = req.params.slot_id

        let slot_data = await TimeSlot.find({_id: slot_id})

        const data = matchedData(req)

        if(!slot_data){
            res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                statusCode: STATUS_CODE.NOT_FOUND,
                data: null,
                msg: getStatusString(STATUS_CODE.NOT_FOUND)
            })
        }

        slot_data = {
            start_time: {
                hour: data.start_time.hour,
                minute: data.start_time.minute,
                ampm: data.start_time.ampm,
            },
            end_time: {
                hour: data.end_time.hour,
                minute: data.end_time.minute,
                ampm: data.end_time.ampm,
            },
            visible: data.visible == undefined || data.visible == null ? false : data.visible
        }

        const updated = await TimeSlot.findOneAndUpdate({_id: slot_id}, {...slot_data})
       
        return res.status(STATUS_CODE.CREATED).json({
            success: true,
            statusCode: STATUS_CODE.CREATED,
            msg: "Time slot updated successfully.",
            data: [slot_data]
        })

    } catch (error) {
        res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        });
    }
}).delete("/:slot_id", slotIdParamValidator(), async (req, res) => {
    try {
        const slot_id = req.params.slot_id
        const deleted = await TimeSlot.findOneAndDelete({_id: slot_id})
        return res.status(STATUS_CODE.OK).json({
            success: true,
            statusCode: STATUS_CODE.OK,
            msg: "Time slot deleted successfully.",
            data: [deleted]
        })        

    } catch (error) {
        res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            data: null,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR)
        });
    }
})

module.exports = router