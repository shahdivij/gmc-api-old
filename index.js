require('dotenv').config()
const env = process.env

const express = require('express')
const morgan = require('morgan')
const app = express()

// app.use(morgan('combined'))

const cors = require('cors')

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cors({
    origin: '*',
    optionsStatusSuccess: 200
}))

const customerRouter = require('./routes/customer')
const carRouter = require('./routes/car')
const clusterRouter = require('./routes/cluster')
const qrcodeRouter = require('./routes/qrcode')
const packageRouter = require('./routes/package')
const subscriptionRouter = require('./routes/subscription')
const holidayRouter = require('./routes/holiday/')
const scheduleRouter = require('./routes/schedule')
const paymentRouter = require('./routes/payment')
const discountRouter = require('./routes/discount')
const tipsRouter = require('./routes/tips')
const refreshRouter = require('./routes/refresh')
const transactionRouter = require('./routes/transaction')

const {
    connectDB,
    closeDB
} = require('./db/init')

connectDB()
app.use("/customer", customerRouter)
app.use("/car", carRouter)
app.use('/cluster', clusterRouter)
app.use('/qrcode', qrcodeRouter)
app.use("/package", packageRouter)
app.use("/subscription", subscriptionRouter)
app.use("/holiday", holidayRouter)
app.use("/schedule", scheduleRouter)
app.use("/payment", paymentRouter)
app.use("/discount", discountRouter)
app.use("/tips", tipsRouter)
app.use("/refresh", refreshRouter)
app.use("/transaction", transactionRouter)

app.get("/", async (req, res) => {
    res.send("Root")
})

app.listen(env.APP_PORT, () => {
    console.log(`GMC API Service started on ${env.APP_HOST}:${env.APP_PORT}`)
})

// listen for TERM signal .e.g. kill
process.on('SIGTERM', closeDB)

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', closeDB);

//or even exit event 

process.on('exit', closeDB)
