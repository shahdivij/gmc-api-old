const express = require('express')
const Transaction = require('../../models/transaction/transaction.model')

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const data = await Transaction.find().populate('paid_by subscription_id', 'customer_id subscription_id').exec()
        return res.status(200).json({
            success: true,
            data: data,
            statusCode: 200,
            message: 'Transaction data.'
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error",
            error: true
        })
    }
})

module.exports = router