const express = require('express')
const router = express.Router()
const localRouter = require('./local')
const nationalRouter = require('./national')
const { STATUS_CODE, getStatusString } = require('../../utility/status')
const Holiday = require('../../models/holiday/nationalholiday.model')

router.use("/local", localRouter)
router.use("/national", nationalRouter)

router.get("/", async (req, res) => {
    try {
        const data = Holiday.find()
        return res.status(STATUS_CODE.OK).json({
            msg: 'Holidays data.',
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
})

module.exports = router