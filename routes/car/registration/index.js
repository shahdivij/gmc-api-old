const express =  require('express')
const router = express.Router()
const Registration = require('./../../../models/car/registration_type.model')
const { isValidObjectId } = require('./../../../utility/common_api_functions')

router.get('/', async (req, res) => {
    const registration_types = await Registration.find()
    return res.status(200).send({
        success: true,
        statusCode: 200,
        data: registration_types,
        msg: "Ok"
    })
}).post("/", async (req,res) => {
    let registration_types_data = req.body
    if(registration_types_data){
        if(!registration_types_data.name){
            return res.status(400).send({
                success: false,
                statusCode: 400,
                data: null,
                msg: "Bad request. Please provide all the required information."
            })
        }
        try{
           let registration_type_name = registration_types_data.name.toLowerCase().trim()
           registration_type_name = registration_type_name[0].toUpperCase() + registration_type_name.slice(1)
            const exists = await Registration.exists({name: registration_type_name})
            if(exists){
                return res.status(409).send({
                    success: false,
                    statusCode: 409,
                    data: null,
                    msg: "Registration Type already exists. Can not add duplicate"
                })
            }
            const registration_type = new Registration({
                name: registration_type_name,
            })
            try {
                const result = await registration_type.save()
                return  res.status(200).send({
                    success: true,
                    data: [result],
                    statusCode: 200,
                    msg: "Registration Type added successfully."
                })
            } catch (error) {
                return  res.status(500).send({
                    success: false,
                    data: null,
                    statusCode: 500,
                    msg: "Could not add Registration Type. Internal Server Error."
                })
            }
        }catch(e){
            return res.status(500).send({
                success: false,
                data: null,
                statusCode: 500,
                msg: "Could not add Registration Type. Internal Server Error."
            })
       }
    }
}).put("/:id", async (req,res) => {
    const registration_type_ID = req.params.id
    if(!isValidObjectId(registration_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Registration Type ID"
        })
        
    try {
        const exists = await Registration.exists({_id : registration_type_ID})
        if(!exists){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Registration Type with id " + registration_type_ID 
            })
        }
        if(exists){
            const  udpatedRegistrationType = await Registration.findByIdAndUpdate(registration_type_ID ,{...req.body}, {new: true})
            return res.status(200).send({
                success: true,
                data: [udpatedRegistrationType],
                statusCode: 200,
                msg: "Registration Type updated."
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Registration Type with id " + registration_type_ID
        })
    }
}).delete("/:id", async (req,res) => {
    const registration_type_ID = req.params.id
    if(!isValidObjectId(registration_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Registration Type ID"
        })
    try {
        const result = await Registration.findByIdAndDelete(registration_type_ID)
        if(result){
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Registration Type deleted."
            })
        }
        if(!result){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Registration Type with id " + registration_type_ID
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete Registration Type with id " + registration_type_ID
        })
    }
})

module.exports = router