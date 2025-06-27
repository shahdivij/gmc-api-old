const express = require('express')
const router = express.Router()
const Residence = require('../../../models/cluster/residence_type.model')
const { isValidObjectId } = require('mongoose')


router.get("/", async (req, res) => {
    const result = await Residence.find()
    return res.status(200).send({
        data: result,
        success: true, 
        msg: "Residence types data.",
        statsCode: 200
    })
}).post("/", async (req, res) => {
    const residenceData = req.body
    if(!residenceData){
        return res.status(400).send({
            data: null,
            msg: "Bad request. No data provided.",
            statusCode: 400,
            success: false
        })
    }
    
    let residenceTypeName = residenceData.name.trim().toLowerCase()
    residenceTypeName = residenceTypeName[0].toUpperCase() + residenceTypeName.slice(1)
    console.log(residenceTypeName)
    try {
        const exists = await Residence.exists({name: residenceTypeName})
        if(exists){
            return res.status(409).send({
                data: null,
                msg: "Residence type already exists. Can not add duplicate.",
                statusCode: 409,
                success: false
            })
        }
    
        const newResidenceType = new Residence({
            ...residenceData,
        })
    
        const result = await newResidenceType.save()
    
        return res.status(200).send({
            data: result,
            msg: "Residence type added successfully.",
            statusCode: 200,
            success: true
        })
    } catch (error) {
        return res.status(500).send({
            data: null,
            msg: "Internal Server Error. Could not add residence type.",
            statusCode: 500,
            success: false
        })
    }
}).put("/:id", async (req, res) => {
    const residenceID = req.params.id
    const residenceData = req.body

    if(!isValidObjectId(residenceID)){
        return res.status(400).send({
            data: null, 
            msg: "Invalid Residence Type ID",
            success: false,
            statusCode: 400
        })
    }

    try {
        const exists = await Residence.exists({_id: residenceID})
        
        if(!exists){
            return res.status(409).send({
                data: null,
                msg: "Residence type does not exist with ID " + residenceID,
                success: false,
                statusCode: 409
            })
        }
    
        if(!residenceData){
            return res.status(400).send({
                data: null,
                msg: "Bad request. No data provided.",
                statusCode: 400,
                success: false
            })
        }
    
        const result = await Residence.findByIdAndUpdate(residenceID, {...residenceData}, {new: true})
    
        return res.status(200).send({
            data: result,
            msg: "Residence Type updated successfully.",
            statusCode: 200,
            success: true
        })
    } catch (error) {
        return res.status(500).send({
            data: null,
            msg: "Internal Server Error. Could not update Residence Type.",
            statusCode: 500,
            success: false
        })
    }
    

}).delete("/:id", async (req, res) => {
    const residenceID = req.params.id
    if(!isValidObjectId(residenceID)){
        return res.status(400).send({
            data: null, 
            msg: "Invalid Residence Type ID",
            success: false,
            statusCode: 400
        })
    }


    try {
        const exists = await Residence.exists({_id: residenceID})
            
        if(!exists){
            return res.status(409).send({
                data: null,
                msg: "Residence type does not exist with ID " + residenceID,
                success: false,
                statusCode: 409
            })
        }
    
        const result = await Residence.findOneAndDelete({_id: residenceID})
    
        return res.status(200).send({
            data: result,
            msg: "Residence Type deleted successfully.",
            statusCode: 200,
            success: true
        })
    } catch (error) {
        return res.status(500).send({
            data: null,
            msg: "Internal Server Error. Could not delete Residence Type.",
            statusCode: 500,
            success: false
        })
    }
})

module.exports = router