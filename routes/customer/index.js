const express = require('express')
const router = express.Router()
const { body, param, validationResult, matchedData } = require('express-validator')

const addressRouteHandler = require('./address')
const signupRouteHandler = require('./signup')
const carRouteHandler = require('./car')
const otpRouteHandler = require('./otp')
const loginRouteHandler = require('./login')
const addressChangeRequestRouteHandler = require('./address/change_request')
const packageCostRouteHandler = require("./package_cost/")

const Customer = require('../../models/customer/customer.model')
const {
    checkMobilenumberExist,
    decrementSequence,
    getNextSequence,
    isValidObjectId,
    checkToken
} = require('../../utility/common_api_functions')
const CONSTANT = require('./../../utility/constants')
const CustomerCar = require('../../models/customer_car')

router.use("/signup", checkToken, signupRouteHandler)
router.use("/otp", otpRouteHandler)
router.use("/login", checkToken, loginRouteHandler)
router.use("/addresschangerequest", addressChangeRequestRouteHandler)
router.use("/packagecost", packageCostRouteHandler)

const { addressQueryValidators, addressBodyValidators } = require("./address/validators")

const validateObjectID = async (req, res, next) => {
    const id = req.params.id
    const carID = req.params.carID

    if(!isValidObjectId(id)){
        return res.status(409).json({
            success: false,
            statusCode: 409,
            msg: "Invalid Customer ID.",
            errors: [{
                "type": "field",
                "value": id,
                "msg": "Invalid Customer ID.",
                "path": "customer_id",
                "location": "params"
            }]
        })
    }

    if(carID){
        if(!isValidObjectId(carID)){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Invalid Car ID",
                errors: [{
                    "type": "field",
                    "value": carID,
                    "msg": "Invalid Car ID.",
                    "path": "carID",
                    "location": "params"
                }]
            })
        }
    }

    if(req.body){
        const fuelTypeID = req.body.fuel_type
        const registrationTypeID = req.body.registration_type
        const transmissionTypeID = req.body.transmission_type
        const modelID = req.body.model

        if(fuelTypeID && registrationTypeID && transmissionTypeID && modelID){
            if(!isValidObjectId(fuelTypeID) && !isValidObjectId(registrationTypeID) && !isValidObjectId(transmissionTypeID) && !isValidObjectId(modelID)){
                return res.status(409).json({
                    success: false,
                    statusCode: 409,
                    msg: "One or more Invalid IDs are provided",
                    errors: [{
                        "type": "field",
                        "value": [fuelTypeID, registrationTypeID, transmissionTypeID, modelID],
                        "msg": "One or more Invalid IDs are provided",
                        "path": "",
                        "location": "body"
                    }]
                })
            }
        }


    }

    next()
}

const checkCustomerExist = async (req, res, next) => {
    const id = req.params.id
    try {
        const exist = await Customer.exists({_id: id})
        if(!exist){
            return res.status(404).json({
                success: false,
                statusCode: 404,
                msg: "Customer does not exist with this ID.",
                errors: [{
                    "type": "field",
                    "value": id,
                    "msg": "Customer does not exist with this ID.",
                    "path": "customer_id",
                    "location": "params"
                }]
            })
        }else{
            next()
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
}

const checkCarExist = async (req, res, next) => {
    const id = req.params.carID
    try {
        const exist = await CustomerCar.exists({_id: id})
        if(!exist){
            return res.status(404).json({
                success: false,
                statusCode: 404,
                msg: "Car does not exist with this ID.",
                errors: [{
                    "type": "field",
                    "value": id,
                    "msg": "Car does not exist with this ID.",
                    "path": "car_id",
                    "location": "params"
                }]
            })
        }else{
            next()
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
}


const addAndUpdateCarBodyValidators = () => {
    return [
        body('registration_number').trim().notEmpty().withMessage("Car Registration Number is required."),
        body('fuel_type').notEmpty().withMessage("Car Fuel Type is required."),
        body('registration_type').notEmpty().withMessage("Car Registration Type is required."),
        body('transmission_type').notEmpty().withMessage("Car Transmission Type is required."),
        body('model').notEmpty().withMessage("Car Model Data is required."),
    ]
}

const customerBodyValidators = () => {
    return [
        body('name').trim().notEmpty().withMessage("Customer name is required."),
        body('email').optional(),
        body('mobile_number').trim().notEmpty().withMessage("Customer mobile number is required."),
        body('profile_picture').optional(),
    ]
}

const customerIDValidator = () => {
    return [
        param('id').trim().notEmpty().custom(async value => {
            if(!value) throw new Error("Customer ID is required.")
            if(!isValidObjectId(value)) throw new Error("Invalid Customer ID.")
            const exists = await Customer.exists({_id: value})
            if(!exists) throw new Error("Customer does not exist with give Customer ID.")
        })
    ]
}

const validateBody = async (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()) {
        next()
    } else {
        return res.status(400).json({
            success: "false",
            statusCode: 400,
            msg: "Bad request.",
            errors: [...errors['errors']]
        })
    }
}



router.get("/", async (req, res) => {
    const customers = await Customer.find().sort({customer_id: 1}).populate({
        path: 'cars',
        populate: ['fuel_type', 'registration_type', 'transmission_type', 'model']
    }).populate({
        path: 'cars',
        populate: {
            path: 'model',
            populate: ['category', 'brand']
        }
    }).populate({
        path: 'cars',
        populate: {
            path: 'subscription',
            populate: ['schedule']
        }
    }).exec()
    return res.status(200).send({
        data: customers,
        success: true,
        statsCode: 200,
        msg: "Customers data"
    })
}).get("/:id", validateObjectID, checkCustomerExist, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate({
            path: 'cars',
            populate: ['fuel_type', 'registration_type', 'transmission_type', 'model']
        }).populate({
            path: 'cars',
            populate: {
                path: 'model',
                populate: ['category', 'brand']
            }
        }).populate({
            path: 'cars',
            populate: {
                path: 'subscription',
                populate: ['schedule']
            }
        }).exec()
        return res.status(200).send({
            data: customer,
            success: true,
            statsCode: 200,
            msg: `Data of the customer ${customer._id}`
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
}).post("/", customerBodyValidators(), validateBody, async (req, res) => {
    const mobile_number = req.body.mobile_number
    const email = req.body.email
    const profile_picture = req.body.profile_picture
    const name = req.body.name
    let isAlreadyRegistered
    let errorResponse = null
    try{
        isAlreadyRegistered = await checkMobilenumberExist(mobile_number, Customer)
        if(isAlreadyRegistered){
            errorResponse = {
                statusCode: 409,
                success: false,
                msg: "Mobile number already registered",
                data: null
            }
        }
    }catch(error){
        errorResponse = {
            statusCode: 500,
            success: false,
            msg: "Could not register customer",
            data: null
        }
    }
    if(errorResponse)
        return res.status(errorResponse.statusCode).send(errorResponse)
    
    const customer_id = await getNextSequence(CONSTANT.MODEL.CUSTOMER)
    if(!isAlreadyRegistered){
        const customer = new Customer({
            name,
            mobile_number,
            role: CONSTANT.ROLE.CUSTOMER,
            profile_picture,
            email,
            customer_id
        })
    
        try {
            const saved = await customer.save()
            return res.status(200).send({
                data: {
                    ...saved._doc
                },
                msg: "Customer registered successfuly",
                statusCode: 200,
                success: true
            })
        } catch (error) {
            console.log(error)
            await decrementSequence('customer')
            return res.status(500).send({
                statusCode: 500,
                success: false,
                msg: "Could not register customer",
                data: null
            })
        }
    }
}).put("/:id", customerBodyValidators(), customerIDValidator(), validateBody, async (req, res) => {
    const data = matchedData(req)
    const customer_id = data.id
    delete data['id']
    if(data.mobile_number){
        delete data['mobile_number']
    }
    try {
        const updated = await Customer.findByIdAndUpdate(customer_id, { ...data }, {new: true})
        
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "Customer updated successfully.",
            data: [updated]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }],
            msg: "Internal Server Error. Could not update customer.",
        });   
    }

}).delete("/:id", customerIDValidator(), validateBody, async (req, res) => {
    const data = matchedData(req)
    const customer_id = data.id
    try {
        const updated = await Customer.findByIdAndUpdate(customer_id, { archive: true })
        return res.status(200).json({
            success: "true",
            statusCode: 200,
            msg: "Customer deleted successfully.",
            data: [updated]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            success: false,
            data: null,
            errors: [{
                "type": "",
                "value": "",
                "msg": "Internal Server Error.",
                "path": "",
                "location": ""
            }],
            msg: "Internal Server Error. Could not delete customer.",
        });   
    }
}).get("/car", carRouteHandler.getAllCar)
.get("/:id/car", validateObjectID, carRouteHandler.getCar)
.get("/:id/car/:carID", validateObjectID, checkCustomerExist, carRouteHandler.getSingleCar)
.post("/:id/car", validateObjectID, checkCustomerExist, addAndUpdateCarBodyValidators(), carRouteHandler.addCar)
.put("/:id/car/:carID", validateObjectID, checkCustomerExist, checkCarExist, addAndUpdateCarBodyValidators(), carRouteHandler.updateCar)
.delete("/:id/car/:carID", validateObjectID, checkCustomerExist, checkCarExist, carRouteHandler.deleteCar)
.get("/:id/address", addressQueryValidators(), addressRouteHandler.getAddress)
.post("/:id/address", addressQueryValidators(), addressBodyValidators(), addressRouteHandler.addAddress)
.put("/:id/address/:addressID", addressQueryValidators(), addressBodyValidators(), addressRouteHandler.updateAddress)
.delete("/:id/address/:addressID", addressQueryValidators(), addressRouteHandler.deleteAddress)


module.exports = router