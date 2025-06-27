const express = require('express')
const router = express.Router({ mergeParams: true });
const Cluster = require('../../../../models/cluster/cluster.model')
const {
    isValidObjectId,
    getNextSequence,
    decrementSequence
} = require('../../../../utility/common_api_functions')
const CONSTANT = require('../../../../utility/constants')
const moment = require('moment');
const { body, validationResult, matchedData } = require('express-validator');

const { default: mongoose } = require('mongoose')

// Function to check if two time slots overlap
function doTimeSlotsOverlap(existingSlot, newSlot) {
    const existingStart = moment(`${existingSlot.start_time.hour}:${existingSlot.start_time.minute} ${existingSlot.start_time.ampm}`, 'h:mm A');
    const existingEnd = moment(`${existingSlot.end_time.hour}:${existingSlot.end_time.minute} ${existingSlot.end_time.ampm}`, 'h:mm A');

    const newStart = moment(`${newSlot.start_time.hour}:${newSlot.start_time.minute} ${newSlot.start_time.ampm}`, 'h:mm A');
    const newEnd = moment(`${newSlot.end_time.hour}:${newSlot.end_time.minute} ${newSlot.end_time.ampm}`, 'h:mm A');

    return newStart.isBefore(existingEnd) && existingStart.isBefore(newEnd);
}



router.get('/', async (req, res) => {
    try {
        const { cluster_id } = req.params;
        const cluster = await Cluster.findById(cluster_id).populate('time_slot').exec();
        if (!cluster) {
            return res.status(404).json({
                success: false,
                data: null,
                statusCode: 400,
                msg: 'Cluster not found.'
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            msg: 'Time slots retrieved successfully.',
            data: cluster.time_slot
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            statusCode: 500,
            msg: 'Internal server error.'
        });
    }
}).post("/", async (req, res) => {
    try {
        const { cluster_id } = req.params;
        if (!req.body) {
            return res.status(409).json({
                data: null,
                statusCode: 409,
                msg: "Bad Request.",
                success: false
            })
        }
        
        // Validate time slot gap (minimum 30 minutes)
        // const start = moment(`${start_time.hour}:${start_time.minute} ${start_time.ampm}`, 'h:mm A');
        // const end = moment(`${end_time.hour}:${end_time.minute} ${end_time.ampm}`, 'h:mm A');
        // if (end.diff(start, 'minutes') < 30) {
        //     return res.status(400).json({
        //         success: false,
        //         data: null,
        //         statusCode: 400,
        //         msg: 'The time slot must be at least 30 minutes long.'
        //     });
        // }

        const cluster = await Cluster.findById(cluster_id);
        if (!cluster) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                data: null,
                msg: 'Cluster not found.'
            });
        }

        // Check for overlapping time slots
        // const newSlot = { start_time, end_time, visible };
        // for (const slot of cluster.time_slot) {
        //     if (doTimeSlotsOverlap(slot, newSlot)) {
        //         return res.status(400).json({
        //             success: false,
        //             data: null,
        //             statusCode: 400,
        //             msg: 'Time slot overlaps with an existing time slot.'
        //         });
        //     }
        // }

        // Add the new time slot
        cluster.time_slot = [...req.body]
        await cluster.save();

        res.status(201).json({
            success: true,
            statusCode: 201,
            msg: 'Time slot added successfully.',
            data: cluster.time_slot
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        });
    }
})

module.exports = router;