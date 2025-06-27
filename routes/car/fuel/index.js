const express =  require('express')
const router = express.Router()
const Fuel = require('./../../../models/car/fuel_type.model')
const { isValidObjectId } = require('./../../../utility/common_api_functions')

router.get('/', async (req, res) => {
    const fuel_types = await Fuel.find()
    return res.status(200).send({
        success: true,
        statusCode: 200,
        data: fuel_types,
        msg: "Ok"
    })
}).post("/", async (req,res) => {
    let fuel_types_data = req.body;
    if(fuel_types_data){
        if(!fuel_types_data.name){
            return res.status(400).send({
                success: false,
                statusCode: 400,
                data: null,
                msg: "Bad request. Please provide all the required information."
            })
        }
        try{
            let fuel_type_name = fuel_types_data.name.toLowerCase().trim()
            fuel_type_name = fuel_type_name[0].toUpperCase() + fuel_type_name.slice(1)
            const exists = await Fuel.exists({name: fuel_type_name})
            if(exists){
                return res.status(409).send({
                    success: false,
                    statusCode: 409,
                    data: null,
                    msg: "Fuel Type already exists. Can not add duplicate"
                })
            }
            const fuel_type = new Fuel({
                name: fuel_type_name,
                image: fuel_types_data.image
            })
            try {
                const result = await fuel_type.save()
                return  res.status(200).send({
                    success: true,
                    data: [result],
                    statusCode: 200,
                    msg: "Fuel Type added successfully."
                })
            } catch (error) {
                return res.status(500).send({
                    success: false,
                    data: null,
                    statusCode: 500,
                    msg: "Could not add Fuel Type. Internal Server Error."
                })
            }
        }catch(e){
            return res.status(500).send({
                success: false,
                data: null,
                statusCode: 500,
                msg: "Could not add Fuel Type. Internal Server Error."
            })
        }
    }
}).put("/:id", async (req,res) => {
    const fuel_type_ID = req.params.id
    if(!isValidObjectId(fuel_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Fuel Type ID"
        })
        
    try {
        
        const exists = await Fuel.exists({_id : fuel_type_ID})
        if(!exists){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Fuel Type with id " + fuel_type_ID 
            })
        }
        if(exists){
            const  updatedFuelType = await Fuel.findByIdAndUpdate(fuel_type_ID ,{name: req.body.name, image: req.body.image}, {new: true})
            
            return res.status(200).send({
                success: true,
                data: [updatedFuelType],
                statusCode: 200,
                msg: "Fuel Type updated."
            })
        }
    } catch (error) {
        
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Fuel Type with id " + fuel_type_ID
        })
    }
}).delete("/:id", async (req,res) => {
    const fuel_type_ID = req.params.id
    if(!isValidObjectId(fuel_type_ID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Fuel Type ID"
        })
    try {
        const result = await Fuel.findByIdAndDelete(fuel_type_ID)
        if(result){
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Fuel Type deleted."
            })
        }
        if(!result){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Fuel Type with id " + fuel_type_ID
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete Fuel Type with id " + fuel_type_ID
        })
    }
})

module.exports = router