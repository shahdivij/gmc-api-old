const express = require('express')

const router = express.Router()

const cleanerRootRoutHandler = require('./root')

router.use("/", cleanerRootRoutHandler)

module.exports = router