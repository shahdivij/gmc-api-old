const express =  require('express')
const router = express.Router()
const Transmission = require('../../../models/car/transmission_type.model')
const { isValidObjectId } = require('../../../utility/common_api_functions')

router.get('/', async (req, res) => {
    const transmission_types = await Transmission.find()
    return res.status(200).send({
        success: true,
        statusCode: 200,
        data: transmission_types,
        msg: "Ok"
    })
}).post("/", async (req,res) => {
    let transmission_types_data = req.body
    if(transmission_types_data){
        if(!transmission_types_data.name){
            return res.status(400).send({
                success: false,
                statusCode: 400,
                data: null,
                msg: "Bad request. Please provide all the required information."
            })
        }
        try{
           let transmission_type_name = transmission_types_data.name.toLowerCase().trim()
           transmission_type_name = transmission_type_name[0].toUpperCase() + transmission_type_name.slice(1) 
           const exists = await Transmission.exists({name: transmission_type_name})
            if(exists){
                return res.status(409).send({
                    success: false,
                    statusCode: 409,
                    data: null,
                    msg: "Transmission Type already exists. Can not add duplicate"
                })
            }
            const transmission_type = new Transmission({
                name: transmission_type_name,
            })
            try {
                const result = await transmission_type.save()
                return  res.status(200).send({
                    success: true,
                    data: [result],
                    statusCode: 200,
                    msg: "Transmission Type added successfully."
                })
            } catch (error) {
                console.log(error)
                return  res.status(500).send({
                    success: false,
                    data: null,
                    statusCode: 500,
                    msg: "Could not add Transmission Type. Internal Server Error."
                })
            }
        }catch(e){
            console.log(e)
            return res.status(500).send({
                success: false,
                data: null,
                statusCode: 500,
                msg: "Could not add Transmission Type. Internal Server Error."
            })
       }
    }
}).put("/:id", async (req,res) => {
    const transmission_type_ID = req.params.id
    if(!isValidObjectId(transmission_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Transmission Type ID"
        })
        
    try {
        const exists = await Transmission.exists({_id : transmission_type_ID})
        if(!exists){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Transmission Type with id " + transmission_type_ID 
            })
        }
        if(exists){
            const  udpatedTransmissionType = await Transmission.findByIdAndUpdate(transmission_type_ID ,{...req.body}, {new: true})
            return res.status(200).send({
                success: true,
                data: [udpatedTransmissionType],
                statusCode: 200,
                msg: "Transmission Type updated."
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Transmission Type with id " + transmission_type_ID
        })
    }
}).delete("/:id", async (req,res) => {
    const transmission_type_ID = req.params.id
    if(!isValidObjectId(transmission_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Transmission Type ID"
        })
    try {
        const result = await Transmission.findByIdAndDelete(transmission_type_ID)
        if(result){
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Transmission Type deleted."
            })
        }
        if(!result){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Transmission Type with id " + transmission_type_ID
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete Transmission Type with id " + transmission_type_ID
        })
    }
})

module.exports = router