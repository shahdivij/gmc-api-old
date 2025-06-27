const express = require('express')

const router = express.Router()

const orderRouteHandler = require("./order")
const verifyRouteHandler = require("./verify")

router.use("/order", orderRouteHandler)
router.use("/verify", verifyRouteHandler)

module.exports = router