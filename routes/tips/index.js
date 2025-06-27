const express = require('express');
const CONSTANT = require('../../utility/constants');
const Tip = require('../../models/tips/tips.model');
const { isValidObjectId } = require('mongoose');




const router = express.Router();


router.get('/cleaner/:cleaner_id', async (req, res) => {
    try {
        const { cleaner_id } = req.params;
        if (!isValidObjectId(cleaner_id))
            return res.status(400).send({
                success: false,
                data: null,
                statusCode: 400,
                msg: "Invalid Brand ID"
            })
        const tips = await Tip.find({ cleaner: cleaner_id }).populate('customer', 'name').populate('cleaner', 'name');

        if (!tips || tips.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                statusCode: 404,
                message: 'No tips found for this service person.'
            });
        }

        return res.status(200).json({
            success: true,
            data: tips,
            statusCode: 200,
            message: 'Tips retrieved successfully.'
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Brand with id " + brandID
        })
    }
}).post("/", async (req, res) => {
    try {
        const { cleaner, customer, amount } = req.body;

        // Validate input
        if (!cleaner || !customer || amount === undefined) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                data: null,
                message: 'Please provide all required information: cleaner, customer, and amount.'
            });
        }

        // Create the tip transaction
        const newTip = new Tip({
            cleaner,
            customer,
            amount
        });

        const savedTip = await newTip.save();

        return res.status(201).json({
            success: true,
            statusCode: 201,
            data: savedTip,
            message: 'Tip transaction recorded successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Could not add Brand. Internal Server Error."
        })
    }
}).get("/customer/:custom_id", async (req, res) => {
    try {
        const { customer_id } = req.params;
        if (!isValidObjectId(customer_id)) {
            return res.status(400).json({
                success: false,
                data: null,
                statusCode: 400,
                message: "Invalid Customer ID"
            });
        }


        const tips = await Tip.find({ customer: customer_id })
            .populate('customer', 'name')
            .populate('cleaner', 'name');

        if (!tips || tips.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                statusCode: 404,
                message: 'No tips found for this customer.'
            });
        }

        return res.status(200).json({
            success: true,
            data: tips,
            statusCode: 200,
            message: 'Tips retrieved successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            statusCode: 500,
            message: "Internal Server Error."
        });
    }
}).put("/:id", async (req, res) => {

}).delete("/:id", async (req, res) => {

});

module.exports = router;