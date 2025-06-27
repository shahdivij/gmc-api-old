const express = require('express')
const router = express.Router()

const verifyRouteHandler = require('./verify')
const resendRouteHandler = require('./resend')
const sendRouteHandler = require('./send')

router.use("/verify", verifyRouteHandler)
router.use("/resend", resendRouteHandler)
router.use('/send', sendRouteHandler)

module.exports = router