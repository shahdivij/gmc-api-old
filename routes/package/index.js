const express = require('express')
const router = express.Router()
const Package = require('../../models/package/package.model')
const { STATUS_CODE, getStatusString } = require('../../utility/status')
const { validationResult, matchedData } = require('express-validator')
const { default: mongoose } = require('mongoose')
const { getNextSequence } = require('./../../utility/common_api_functions')
const CONSTANT = require('./../../utility/constants')
const { queryValidators, bodyValidators } = require('./validators')

router.get("/", async (req, res) => {
    try {
        const data = await Package.find().populate().exec()
        return res.status(STATUS_CODE.OK).json({
            msg: 'Packages data.',
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
}).post("/", bodyValidators(), async (req, res) => {
    console.log('body --> ', req.body)
    const result = validationResult(req)
    console.log('errors --> ', result.array())
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }
    const matchedBodyData = matchedData(req)

    console.log('matchedBodyData --> ', matchedBodyData)

    if(matchedBodyData._2nd_car_onward_off && (parseInt(matchedBodyData._2nd_car_onward_off) > 25)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: "field",
                location: "body",
                param: "_2nd_car_onward_off",
                value: matchedBodyData._2nd_car_onward_off,
                msg: `This value should be less than or equal to 25.`
            }]
        })
    }

    if(matchedBodyData.package_type && matchedBodyData.package_type == "DEMO"){
        const demoExist = await Package.exists({package_type: "DEMO"})
        if(demoExist){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "package_type",
                    value: "DEMO",
                    msg: `DEMO package already exists.`
                }]
            })
        }
    }

    const session = await mongoose.startSession()

    try {
        let package_name = matchedBodyData.name.trim().toLowerCase()
        package_name = package_name[0].toUpperCase() + package_name.slice(1)
        const packageExist = await Package.exists({name: package_name})
        if(packageExist){
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                msg: getStatusString(STATUS_CODE.BAD_REQUEST),
                statusCode: STATUS_CODE.BAD_REQUEST,
                success: false,
                errors: [{
                    type: "field",
                    location: "body",
                    param: "name",
                    value: package_name,
                    msg: `Package already exists with this name.`
                }]
            })
        }
        session.startTransaction()
        const packageID = await getNextSequence(CONSTANT.MODEL.PACKAGE, session)
        const newPackage = new Package({
            ...matchedBodyData,
            package_id: packageID
        })

        const saved = await newPackage.save()
        session.commitTransaction()
        return res.status(STATUS_CODE.OK).json({
            msg: "Package created successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: saved
        })
    } catch (error) {
        session.abortTransaction()
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
        })
    } 

}).put("/:id", queryValidators(), bodyValidators(), async (req, res) => {
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }

    const matchedBodyData = matchedData(req)

    if(matchedBodyData._2nd_car_onward_off && (parseInt(matchedBodyData._2nd_car_onward_off) > 25)){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: [{
                type: "field",
                location: "body",
                param: "_2nd_car_onward_off",
                value: matchedBodyData._2nd_car_onward_off,
                msg: `This value should be less than or equal to 25.`
            }]
        })
    }

    const id = matchedBodyData.id
    const dataToUpdate = {
        ...matchedBodyData
    }
    delete dataToUpdate.id
    try {
        const updatedPackage = await Package.findByIdAndUpdate(id, dataToUpdate, {new: true})
        return res.status(STATUS_CODE.OK).json({
            msg: "Package updated successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: updatedPackage
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
        })
    }
}).delete("/:id", queryValidators(), async (req, res) => {
    const result = validationResult(req)
    if(!result.isEmpty()){
        console.log(result.array())
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }

    const matchedBodyData = matchedData(req)
    const id = matchedBodyData.id
    
    try {
        const deletedPackage = await Package.find({_id: id}).populate().exec()
        await Package.findByIdAndDelete(id)
        return res.status(STATUS_CODE.OK).json({
            msg: "Package deleted successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
            data: deletedPackage
        })
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            success: false,
        })
    }
})
module.exports = router