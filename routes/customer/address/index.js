const asyncHandler = require("express-async-handler")
const CONSTANT = require('./../../../utility/constants')
const IDs = require("../../../models/ids/ids.model")
const Customer = require("../../../models/customer/customer.model")
const { validationResult, matchedData } = require("express-validator")
const { STATUS_CODE, getStatusString } = require("./../../../utility/status")

exports.getAddress = asyncHandler(async (req, res, next) => {
   
    try {
        const customer = await Customer.find({_id: req.params.id})
        
        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "Customer Address data.",
            data: customer[0].addresses
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

exports.addAddress = asyncHandler(async (req, res, next) => {

    console.log(req.body)
    const result = validationResult(req)
    console.log(result.array())
    if(!result.isEmpty()){
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            msg: getStatusString(STATUS_CODE.BAD_REQUEST),
            statusCode: STATUS_CODE.BAD_REQUEST,
            success: false,
            errors: result.array()
        })
    }

    const matchedBodyData = matchedData(req)
    console.log(matchedBodyData)

    const customerID = req.params.id
    
    const addressData = matchedBodyData

    try {

        const exists = await Customer.exists({_id: customerID}).where({"addresses.address_type": { $eq: addressData.address_type }})
        
        if(["HOME", "OFFICE"].includes(addressData.address_type) && exists){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Address with type " + addressData.address_type  + "  already exists.",
                errors: [{
                    "type": "field",
                    "value": addressData.address_type,
                    "msg": "Address with type " + addressData.address_type  + "  already exists.",
                    "path": "address_type",
                    "location": "body"
                }]
            }) 
        }

        if(addressData.other_name && addressData.address_type == "OTHER"){
            const existsName = await Customer.exists({_id: customerID}).where({"addresses.other_name": { $eq: addressData.other_name }})
            if(existsName){
                return res.status(409).json({
                    success: false,
                    statusCode: 409,
                    msg: "Address with this name already exists.",
                    errors: [{
                        "type": "field",
                        "value": addressData.other_name,
                        "msg": "Address with this name already exists",
                        "path": "other_name",
                        "location": "body"
                    }]
                })
            }
        }
 
        await Customer.updateOne({_id: customerID}, {$push: {addresses: [addressData]}})

        return res.status(STATUS_CODE.OK).json({
            msg: "Address Added successfully.",
            statusCode: STATUS_CODE.OK,
            success: true,
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
exports.updateAddress = asyncHandler(async (req, res, next) => {
    const customerID = req.params.id
    const addressID = req.params.addressID
    const addressData = req.body
    try {
        const exists = await Customer.exists({_id: customerID}).where({"addresses._id": addressID})
        
        if(!exists){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Address with this ID does not exist.",
                errors: [{
                    "type": "field",
                    "value": addressID,
                    "msg": "Address with this ID does not exist.",
                    "path": "addressID",
                    "location": "query"
                }]
            }) 
        }

        const customer = await Customer.find({_id: customerID}, 'addresses').where({"addresses._id": addressID}).populate("addresses").exec()

        const address = customer && customer.length && customer[0].addresses.filter(address => address._id == addressID)[0]


        if(address && address.address_type == "HOME" && address.locked){
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Can not change address. Address is locked.",
                errors: [{
                    "type": "",
                    "value": null,
                    "msg": "Can not change address. Address is locked.",
                    "path": "",
                    "location": ""
                }]
            }) 
        }
        
        const toBeUpdatedAddresses = []
        customer[0].addresses.forEach(address => {
            if(address._id == addressID){
                toBeUpdatedAddresses.push(addressData)
            } else {
                toBeUpdatedAddresses.push(address)
            }
        })

        await Customer.updateOne({_id: customerID}, {$set: {"addresses": toBeUpdatedAddresses}}, {new: true})
        
        return res.status(200).json({
            success: true,
            statusCode: 200,
            msg: "Address updated successfully.",
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
exports.deleteAddress = asyncHandler(async (req, res, next) => {
    const customerID = req.params.id
    const addressID = req.params.addressID
    try {
        const customerAddressData = await Customer.find({_id: customerID}, 'addresses')
        
        if(customerAddressData[0].addresses && customerAddressData[0].addresses.length > 0){
            const addressToDelete = customerAddressData[0].addresses.filter(address => address._id == addressID)
            
            if(addressToDelete && addressToDelete.length > 0){
                if(addressToDelete[0].address_type == "HOME"){
                    return res.status(409).json({
                        success: false,
                        statusCode: 409,
                        msg: "HOME Address can not be deleted.",
                    }) 
                } else {
                    const remainingAddresses = customerAddressData[0].addresses.filter(address => address._id != addressID)
                    
                    const udpated = await Customer.findByIdAndUpdate(customerID, {addresses: remainingAddresses}, {new: true})
                    return res.status(200).json({
                        success: true,
                        statusCode: 200,
                        msg: "Address is deleted successfully.",
                        data: [{}]
                    })
                }
            } else {
                return res.status(409).json({
                    success: false,
                    statusCode: 409,
                    msg: "Customer has no addresses with given address ID to delete.",
                }) 
            }
        } else {
            return res.status(409).json({
                success: false,
                statusCode: 409,
                msg: "Customer has no addresses to delete.",
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
