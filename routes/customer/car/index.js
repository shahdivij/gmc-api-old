const asyncHandler = require("express-async-handler")
const CustomerCar = require('./../../../models/customer_car')
const { isValidObjectId, getNextSequence } = require("../../../utility/common_api_functions")
const CONSTANT = require('./../../../utility/constants')
const IDs = require("../../../models/ids/ids.model")
const Customer = require("../../../models/customer/customer.model")
const { matchedData } = require("express-validator")
const { STATUS_CODE, getStatusString } = require("../../../utility/status")

exports.getCar = asyncHandler(async (req, res, next) => {
    // get all cars of a single customer
    const customer_id = req.params.id
    try {
        const data = await CustomerCar.find({customer_id: customer_id}).populate('fuel_type registration_type transmission_type model').populate({
            path: 'model',
            populate: 'brand category'
        }).populate({
            path: 'subscription',
            populate: 'schedule'
        }).exec()
        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "Customer Cars data.",
            data: data
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        })
    }
})

exports.getAllCar = asyncHandler(async (req, res, next) => {
    // get all cars
    try {
        const data = await CustomerCar.find().populate()
        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "Customer Cars data.",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        })
    }
})

exports.getSingleCar = asyncHandler(async (req, res, next) => {
    // get single car of a single customer
    const carID = req.params.carID
    try {
        const carsData = await CustomerCar.find({_id: carID}).populate('fuel_type').populate('registration_type').populate('transmission_type').populate({
            path: 'model',
            populate: ['category', 'brand']
        }).populate({
            path: 'subscription',
            populate: ['schedule']
        }).populate('customer_id').exec()
        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "Customer Single Car data.",
            data: carsData
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            errors: [{
                "type": "",
                "value": "",
                "msg": getStatusString(STATUS_CODE.INTERNAL_ERROR),
                "path": "",
                "location": ""
            }]
        })
    }
})
exports.addCar = asyncHandler(async (req, res, next) => {
    const customerID = req.params.id
    const fuelTypeID = req.body.fuel_type
    const registrationTypeID = req.body.registration_type
    const transmissionTypeID = req.body.transmission_type
    const modelID = req.body.model
    const uploadedModelPicture = req.body.uploaded_model_picture
    const registrationNumber = req.body.registration_number

    const idData = await IDs.find()

    try {

        const exists = await CustomerCar.exists({registration_number: registrationNumber})
        if(exists){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Car with this registration number already exists.",
                errors: [{
                    "type": "field",
                    "value": registrationNumber,
                    "msg": "Car with this registration number already exists.",
                    "path": "registration_number",
                    "location": "body"
                }]
            }) 
        }

        const carID = await getNextSequence(CONSTANT.MODEL.CUSTOMER_CAR)
    
        const newCar = new CustomerCar({
            car_id: carID,
            fuel_type: fuelTypeID,
            registration_type: registrationTypeID,
            transmission_type: transmissionTypeID,
            model: modelID,
            customer_id: customerID,
            uploaded_model_picture: uploadedModelPicture && uploadedModelPicture.image_data ? {
                ...uploadedModelPicture,
                name: carID
            } : null,
            registration_number: registrationNumber
        })

        const result = await newCar.save()
        const updatedCustomer = await Customer.updateOne({_id: customerID}, {$push: {cars: result._id}})

        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "New Car added successfully.",
            data: [newCar]
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        })   
    }
})
exports.updateCar = asyncHandler(async (req, res, next) => {
    const customerID = req.params.id
    const carID = req.params.carID
    const fuelTypeID = req.body.fuel_type
    const registrationTypeID = req.body.registration_type
    const transmissionTypeID = req.body.transmission_type
    const modelID = req.body.model
    const uploadedModelPicture = req.body.uploaded_model_picture
    const registrationNumber = req.body.registration_number

    try {
        const exists = await CustomerCar.find({registration_number: registrationNumber}).where({_id: {$ne: carID}})
        
        if(exists.length){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Car with this registration number already exists.",
                errors: [{
                    "type": "field",
                    "value": registrationNumber,
                    "msg": "Car with this registration number already exists.",
                    "path": "registration_number",
                    "location": "body"
                }]
            }) 
        }
    
        const carData = await CustomerCar.find({_id: carID})

        let updateCarData = {
            fuel_type: fuelTypeID,
            registration_type: registrationTypeID,
            transmission_type: transmissionTypeID,
            model: modelID,
            registration_number: registrationNumber,
            uploaded_model_picture: uploadedModelPicture?.image_data && carData?.uploaded_model_picture?.image_data ? {
                name: carID,
                image_data: uploadedModelPicture?.image_data || carData?.uploaded_model_picture?.image_data || null
            } : null
        }

        if(carData.subscription != null){
            updateCarData = {
                fuel_type: fuelTypeID,
                registration_type: registrationTypeID,
                transmission_type: transmissionTypeID,
                model: carData.model._id,
                registration_number: carData.registration_number,
                uploaded_model_picture: uploadedModelPicture?.image_data && carData?.uploaded_model_picture?.image_data ? {
                    name: carID,
                    image_data: uploadedModelPicture?.image_data || carData?.uploaded_model_picture?.image_data || null
                } : null
            }
        }


        const updatedCar = await CustomerCar.findByIdAndUpdate(carID, updateCarData, {new: true})
        console.log(updatedCar)

        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "New Car added successfully.",
            data: []
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        })   
    }
})
exports.deleteCar = asyncHandler(async (req, res, next) => {
    const customerID = req.params.id
    const carID = req.params.carID
    try {
        const carData = await CustomerCar.find({_id: carID})
        console.log(carData)
        if(carData[0].subscription == null){
            let deletedCar = await CustomerCar.deleteOne({_id: carID})
            let deletedFromCustomer = await Customer.findByIdAndUpdate(customerID, {$pull: {cars: carID}}, {new: true})
           
            return res.status(200).json({
                success: true,
                statusCode: 200,
                msg: "Car deleted successfully.",
                data: carData
            }) 
        }else{
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Can not delete a car having a subscription.",
                errors: [{
                    "type": "field",
                    "value": carID,
                    "msg": "Can not delete a car having a subscription.",
                    "path": "car_id",
                    "location": "params"
                }]
            }) 
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            msg: "Internal Server Error.",
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }]
        })  
    }
})