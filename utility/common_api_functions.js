const mongoose = require('mongoose')
const IDs = require('../models/ids/ids.model')
const CONSTANT = require('./constants')
var jwt = require('jsonwebtoken')
const { DateTime } = require('luxon')

const checkMobilenumberExist = async (mobile_number, model) => {
    const exists = await model.findOne({ mobile_number: mobile_number })
    if (exists)
        return (true)
    return false
}

async function getNextSequence(name, session) {

    try {

        let doc = await IDs.findOne()

        const ret = session ? await IDs.findOneAndUpdate(
            { [name]: { $gte: 0 } },
            { $inc: { [name]: 1 } },
            { new: true }
        ).session(session) : await IDs.findOneAndUpdate(
            { [name]: { $gte: 0 } },
            { $inc: { [name]: 1 } },
            { new: true }
        )

        if(ret == null){
            doc[name] = 1
            await doc.save()

            return CONSTANT.ID_PREFIX[name] + 0
        } else {
    
            switch (name) {
                case CONSTANT.MODEL.CUSTOMER: return CONSTANT.ID_PREFIX.CUSTOMER + ret[name]
                case CONSTANT.MODEL.CAR.BRAND: return CONSTANT.ID_PREFIX.CAR.BRAND + ret[name]
                case CONSTANT.MODEL.CAR.MODEL: return CONSTANT.ID_PREFIX.CAR.MODEL + ret[name]
                case CONSTANT.MODEL.CAR.CATEGORY: return CONSTANT.ID_PREFIX.CAR.CATEGORY + ret[name]
                case CONSTANT.MODEL.CLUSTER.CLUSTER: return CONSTANT.ID_PREFIX.CLUSTER.CLUSTER + ret[name]
                case CONSTANT.MODEL.CAR.CAR: return CONSTANT.ID_PREFIX.CAR.CAR + ret[name]
                case CONSTANT.MODEL.CLEANER: return CONSTANT.ID_PREFIX.CLEANER + ret[name]
                case CONSTANT.MODEL.SUPERVISOR: return CONSTANT.ID_PREFIX.SUPERVISOR + ret[name]
                case CONSTANT.MODEL.APARTMENT: return CONSTANT.ID_PREFIX.APARTMENT + ret[name]
                case CONSTANT.MODEL.ADMIN: return CONSTANT.ID_PREFIX.ADMIN + ret[name]
                case CONSTANT.MODEL.CLUSTER.REQUEST: return CONSTANT.ID_PREFIX.CLUSTER.REQUEST + ret[name]
                case CONSTANT.MODEL.QRCODE_SERIES: return CONSTANT.ID_PREFIX.QRCODE_SERIES + ret[name]
                case CONSTANT.MODEL.CUSTOMER_CAR: return CONSTANT.ID_PREFIX.CUSTOMER_CAR + ret[name]
                case CONSTANT.MODEL.PACKAGE: return CONSTANT.ID_PREFIX.PACKAGE + ret[name]
                case CONSTANT.MODEL.SUBSCRIPTION: return CONSTANT.ID_PREFIX.SUBSCRIPTION + ret[name]
                case CONSTANT.MODEL.SCHEDULE: return CONSTANT.ID_PREFIX.SCHEDULE + ret[name]
                case CONSTANT.MODEL.CHANGE_ADDRESS_REQUEST: return CONSTANT.ID_PREFIX.CHANGE_ADDRESS_REQUEST + ret[name]
                case CONSTANT.MODEL.DISCOUNT: return CONSTANT.ID_PREFIX.DISCOUNT + ret[name]
                case CONSTANT.MODEL.TRANSACTION: return CONSTANT.ID_PREFIX.TRANSACTION + ret[name]
                default: return null;
            }
        }

    } catch (error) {
        console.log(error);
        return null;
    }
}

async function decrementSequence(name) {
    await IDs.findOneAndUpdate(
        { [name]: { $gte: 0 } },
        { $inc: { [name]: -1 } },
        { new: true }
    )
}

const isValidObjectId = object_id => object_id ? mongoose.Types.ObjectId.isValid(object_id) && new mongoose.Types.ObjectId(object_id) == object_id : false

const isValidCarRegistrationNumber = (registrationNumber) => {
    // const pattern = RegExp('[a-zA-A]{1,1}[a-zA-A]{1,1}[0-9]{1,1}[0-9]{1,1}[a-zA-A]{1,1}[a-zA-A]{1,1}[0-9]{1,1}[0-9]{1,1}[0-9]{1,1}[0-9]{1,1}')
    const pattern = /\b[a-zA-Z]{2}\d{2}[a-zA-Z]{2}\d{4}\b/g
    return pattern.test(registrationNumber)
}

const sendOTP = async (mobileNumber) => {
    const options = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/JSON"
        }
    }

    const url = process.env.OTP_API + "/otp?template_id=" + process.env.OTP_SMS_TEMPLATE_ID + "&mobile=" + mobileNumber + "&authkey=" + process.env.OTP_AUTH_KEY

    try {
        const result = await fetch(url, options)
        const response = await result.json()
        return response
    } catch (error) {
        return error
    }
}

const resendOTP = async (mobileNumber) => {
    const options = {
        "method": "GET",
        "headers": {
            "Content-Type": "application/JSON"
        }
    }

    const url = process.env.OTP_API + "/otp/retry?authkey=" + process.env.OTP_AUTH_KEY + "&retrytype=text&mobile=" + mobileNumber
    console.log(url)
    try {
        const result = await fetch(url, options)
        const response = await result.json()
        return response
    } catch (error) {
        return error
    }
}

const verifyOTP = async (otp, mobileNumber) => {
    const options = {
        "method": "GET",
        "headers": {
            "Content-Type": "application/JSON",
            "authkey": process.env.OTP_AUTH_KEY
        }
    }

    const url = process.env.OTP_API + "/otp/verify?otp=" + otp + "&mobile=" + mobileNumber

    try {
        const result = await fetch(url, options)
        const response = await result.json()
        return response
    } catch (error) {
        return error
    }
}

const getAccessToken = async (data, option) => {
    let options = option || {}
    try {
        const token = await jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, options)
        return token
    } catch (error) {
        return error
    }
}

const getRefreshToken = async (data, option) => {
    let options = option || {}
    try {
        const token = await jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, options)
        return token
    } catch (error) {
        return error
    }
}

const verifyAccessToken = async (token) => {
    try {
        const verified = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return verified
    } catch (error) {
        return error
    }
}

const verifyRefreshToken = async (token) => {
    try {
        const verified = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        return verified
    } catch (error) {
        return error
    }
}

const checkToken = (req, res, next) => {
    const header = req.headers['authorization']

    if (typeof header !== 'undefined') {
        const bearer = header.split(' ')
        const token = bearer[1]

        req.token = token
        next()
    } else {
        //If header is undefined return Forbidden (403)
        return res.status(403).json({
            success: false,
            statusCode: 403,
            msg: "Token not provided.",
            errors: [{
                "type": "field",
                "value": header,
                "msg": "Token not provided.",
                "path": "Authorization",
                "location": "Headers"
            }]
        })
    }
}


const createSchedule = (data) => {
    console.log("createSchedule starts -------------------------")
    // console.log(data)
    const packageDaysCount = data.number_of_days
    const interiorCleaningDaysCount = data.interior_cleaning
    const exteriorCleaningDaysCount = data.exterior_cleaning
    const nationalHolidays = data.national_holidays
    const localHolidays = data.local_holidays
    const offDaysStringArray = data.off_days
    const startDate = data.startDate
    const endDate = data.endDate
    const offDays = []

    console.log(data)

    for (let date = startDate; date <= endDate;) {
        console.log(date)
        if (offDaysStringArray.includes(DateTime.fromISO(date).weekdayLong.toUpperCase()) && !nationalHolidays.includes(DateTime.fromISO(date).toISODate()) && !localHolidays.includes(DateTime.fromISO(date).toISODate())) {
            offDays.push(DateTime.fromISO(date).toISODate())
        }
        date = DateTime.fromISO(date).plus({ days: 1 }).toISODate()
    }

    let interiorCleaningDays = []
    let gapDaysAfterInteriorCleaning = []
    let gapDays = []
    let exteriorCleaningDays = []
    let availableDays = []

    // function to schedules the interior
    const scheduleInteriorCleaning = date_ => {
        const date = date_
        if (offDays.includes(date) || nationalHolidays.includes(date) || localHolidays.includes(date)) {
            return scheduleInteriorCleaning(DateTime.fromISO(date).plus({ days: 1 }))
        } else {
            return DateTime.fromISO(date).toISODate()
        }
    }

    // function to schedule gaps
    const scheduleGap = date_ => {
        const date = date_
        if (offDays.includes(date) || nationalHolidays.includes(date) || interiorCleaningDays.includes(date) || gapDaysAfterInteriorCleaning.includes(date)) {
            return scheduleGap(DateTime.fromISO(date).plus({ days: 1 }).toISODate())
        } else {
            return date
        }
    }


    const getECDateForward = date => {
        if (exteriorCleaningDays.includes(date)) {
            if (isECDate(date)) return date
            return getECDateForward(DateTime.fromISO(date).plus({ days: 1 }).toISODate())
        }
        return getECDateForward(DateTime.fromISO(date).plus({ days: 1 }).toISODate())
    }

    const getECDateBackward = date => {
        if (exteriorCleaningDays.includes(date)) {
            if (isECDate(date)) return date
            return getECDateBackward(date - 1)
        }
        return getECDateForward(date - 1)
    }

    const isECDate = date => {
        return exteriorCleaningDays.includes(date)
    }

    console.log(offDays)
    console.log(nationalHolidays)
    console.log(localHolidays)
    console.log(packageDaysCount)
    // calculates the actual working days to schedules the cleanings and gaps
    const workingDaysCount = packageDaysCount - offDays.length - nationalHolidays.length - localHolidays.length
    console.log(workingDaysCount)
    // calculates the gap that should be followed among interior cleanings 
    const interiorCleaningGap = parseInt(packageDaysCount / interiorCleaningDaysCount)

    // console.log("workingDaysCount -> ", workingDaysCount)
    // console.log("interiorCleaningGap -> ", interiorCleaningGap)

    let lastInteriorCleaningDate = 0
    let interiorCleaningDaysCounter = 0

    let freeDays = 0
    // checks if we can schedules gap after each interior cleanings
    // --- means if we have free days > Interior cleanings
    let followGapAfterInteriorCleaning = false
    if (workingDaysCount - exteriorCleaningDaysCount - interiorCleaningDaysCount >= interiorCleaningDaysCount && interiorCleaningDaysCount > 0) {
        followGapAfterInteriorCleaning = true
    }

    // console.log("followGapAfterInteriorCleaning -> ", followGapAfterInteriorCleaning)
    // calculates the free days we have after scheduling gap after each interior cleanings if applicable 
    if (followGapAfterInteriorCleaning) {
        freeDays = workingDaysCount - exteriorCleaningDaysCount - interiorCleaningDaysCount - interiorCleaningDaysCount
    } else {
        freeDays = workingDaysCount - exteriorCleaningDaysCount - interiorCleaningDaysCount
    }

    // console.log("freeDays -> ", freeDays)

    // prepare the schedules for the interior cleanings
    if (interiorCleaningDaysCount > 0) {
        for (let date = startDate.valueOf(); date <= endDate.valueOf();) {
            if (interiorCleaningDaysCounter < interiorCleaningDaysCount) {
                if (date == startDate.valueOf() || date == DateTime.fromISO(lastInteriorCleaningDate).plus({ days: interiorCleaningGap }).toISODate().valueOf()) {
                    const date_ = scheduleInteriorCleaning(DateTime.fromISO(date).toISODate())
                    interiorCleaningDays.push(date_)
                    lastInteriorCleaningDate = date_
                    interiorCleaningDaysCounter += 1
                }
            }
            date = DateTime.fromISO(date).plus({ days: 1 }).toISODate().valueOf()
        }
    }

    // console.log("interiorCleaningDays -> ", interiorCleaningDays)
    // if free days > interior cleanings then schedules the gap after each interior cleanings
    if (followGapAfterInteriorCleaning) {
        interiorCleaningDays.forEach(date => {
            gapDaysAfterInteriorCleaning.push(scheduleInteriorCleaning(DateTime.fromISO(date).plus({ days: 1 }).toISODate()))
            // if(freeDays){
            // }
        })
    }

    // console.log("gapDaysAfterInteriorCleaning -> ", gapDaysAfterInteriorCleaning)

    gapDays = []
    let lastGapDate = 0
    let gapDifference = 0
    if (freeDays > 0) {
        // schedules the gap after as many interior cleanings as possible out of the free days
        if (!followGapAfterInteriorCleaning && interiorCleaningDaysCount > 0 && freeDays <= interiorCleaningDaysCount) {
            let gapDaysCounter = 0
            interiorCleaningDays.forEach(date => {
                if (freeDays > 0) {
                    if (!offDays.includes(DateTime.fromISO(date).plus({ days: 1 }).toISODate()) || !nationalHolidays.includes(DateTime.fromISO(date).plus({ days: 1 }).toISODate())) {
                        gapDaysAfterInteriorCleaning.push(DateTime.fromISO(date).plus({ days: 1 }).toISODate())
                    } else {
                        gapDaysAfterInteriorCleaning.push(scheduleGap(DateTime.fromISO(date).plus({ days: 1 }).toISODate()))
                    }
                    gapDaysCounter += 1
                    freeDays = freeDays - 1
                }
            })
        }
    }

    // function to schedule the exterior cleanings
    let scheduleExteriorCleaning = date_ => {
        const date = date_
        if (interiorCleaningDays.includes(DateTime.fromISO(date).toISODate()) || offDays.includes(DateTime.fromISO(date).toISODate()) || localHolidays.includes(DateTime.fromISO(date).toISODate()) || nationalHolidays.includes(DateTime.fromISO(date).toISODate()) || gapDaysAfterInteriorCleaning.includes(DateTime.fromISO(date).toISODate())) {
            return scheduleExteriorCleaning(DateTime.fromISO(date).plus({ days: 1 }).toISODate())
        } else {
            return DateTime.fromISO(date).toISODate()
        }
    }

    exteriorCleaningDays = []
    let exteriorCleaningDaysCounter = 0

    for (let date = DateTime.fromISO(startDate).toISODate().valueOf(); date <= DateTime.fromISO(endDate).toISODate().valueOf();) {
        if (!exteriorCleaningDays.includes(date)) {
            exteriorCleaningDays.push(scheduleExteriorCleaning(DateTime.fromISO(date).toISODate()))
            exteriorCleaningDaysCounter += 1
        }
        date = DateTime.fromISO(date).plus({ days: 1 }).toISODate().valueOf()
    }

    exteriorCleaningDaysSet = new Set(exteriorCleaningDays)
    exteriorCleaningDays = [...exteriorCleaningDaysSet]

    let startDate_ = 0
    let endDate_ = 0
    let ecCounter = 0
    if (freeDays > exteriorCleaningDaysCount) {
        exteriorCleaningDays.forEach((date, index, exteriorCleaningDays) => {
            if (ecCounter < exteriorCleaningDaysCount) {
                if (index % 2 == 0) {
                    const sDate = exteriorCleaningDays[index + 1]
                    gapDays.push(sDate)
                    startDate_ = sDate
                } else {
                    const sDate = exteriorCleaningDays[exteriorCleaningDays.length - (index + 1)]
                    gapDays.push(sDate)
                    endDate_ = sDate
                }
                ecCounter += 1
            }
        })

        if (startDate_ < endDate_) {
            const startIndex = exteriorCleaningDays.indexOf(startDate_)
            const endIndex = exteriorCleaningDays.indexOf(endDate_)
            for (let index = startIndex; index <= endIndex; index++) {
                const sDate = exteriorCleaningDays[index]
                gapDays.push(sDate)
            }
        }
    }

    if (freeDays < exteriorCleaningDaysCount) {
        exteriorCleaningDays.forEach((date, index, exteriorCleaningDays) => {
            if (freeDays > 0) {
                if (index % 2 == 0) {
                    const sDate = exteriorCleaningDays[index + 1]
                    gapDays.push(sDate)
                    startDate_ = sDate
                } else {
                    const sDate = exteriorCleaningDays[exteriorCleaningDays.length - (index + 1)]
                    gapDays.push(sDate)
                    endDate_ = sDate
                }
                freeDays = freeDays - 1
            }
        })
    }

    if (exteriorCleaningDaysCount == 0) {
        exteriorCleaningDays.forEach(date => gapDays.push(date))
    }

    // console.log("FINAL RESULT")
    // console.log("exteriorCleaningDays -> ", exteriorCleaningDays)
    // console.log("interiorCleaningDays -> ", interiorCleaningDays)
    // console.log("gapDaysAfterInteriorCleaning -> ", gapDaysAfterInteriorCleaning)
    // console.log("gapDays -> ", gapDays)


    const scheduleData = []

    interiorCleaningDays.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: "INTERIOR",
            day_type: "WORKING_DAY",
            status: "INCOMPLETE",
        })
    })

    gapDaysAfterInteriorCleaning.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: null,
            day_type: "NON_WORKING_DAY",
            status: null,
        })
    })

    exteriorCleaningDays.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: "EXTERIOR",
            day_type: "WORKING_DAY",
            status: "INCOMPLETE",
        })
    })

    offDays.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: null,
            day_type: "OFF_DAY",
            status: null,
        })
    })

    localHolidays.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: null,
            day_type: "LOCAL_HOLIDAY",
            status: null,
        })
    })

    nationalHolidays.forEach(date => {
        scheduleData.push({
            date: date,
            cleaning_type: null,
            day_type: "NATIONAL_HOLIDAY",
            status: null,
        })
    })

    return scheduleData
}


const getPackageCost = () => {

}

module.exports = {
    checkMobilenumberExist,
    getNextSequence,
    decrementSequence,
    isValidObjectId,
    isValidCarRegistrationNumber,
    sendOTP,
    verifyOTP,
    resendOTP,
    getAccessToken,
    checkToken,
    verifyRefreshToken,
    verifyAccessToken,
    createSchedule,
    getRefreshToken
}