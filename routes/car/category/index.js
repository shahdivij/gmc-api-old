const express =  require('express');
const Category = require('../../../models/car/category.model');
const { isValidObjectId } = require('mongoose');
const { getNextSequence, decrementSequence } = require('../../../utility/common_api_functions');
const router = express.Router()
const CONSTANTS = require('./../../../utility/constants')

router.get('/', async (req, res) => {
    const categories = await Category.find()
    return res.status(200).send({
        success: true,
        statusCode: 200,
        data: categories,
        msg: "Ok"
    })
}).post("/", async (req,res) => {
    let categoryData = req.body
    if(categoryData){
        if(!categoryData.name){
            return res.status(400).send({
                success: false,
                statusCode: 400,
                data: null,
                msg: "Bad request. Please provide all the required information."
            })
        }
        try{
           let category_name = categoryData.name.toLowerCase().trim()
           category_name = category_name[0].toUpperCase() + category_name.slice(1)
            const exists = await Category.exists({name: category_name})
            if(exists){
                return res.status(409).send({
                    success: false,
                    statusCode: 409,
                    data: null,
                    msg: "Category already exists. Can not add duplicate"
                })
            }

            const category_id = await getNextSequence(CONSTANTS.MODEL.CAR.CATEGORY)
            const category = new Category({
                name: category_name,
                category_id: category_id
            })
            try {
                const result = await category.save()
                return  res.status(200).send({
                    success: true,
                    data: [result],
                    statusCode: 200,
                    msg: "Category added successfully."
                })
            } catch (error) {
                return  res.status(500).send({
                    success: false,
                    data: null,
                    statusCode: 500,
                    msg: "Could not add category. Internal Server Error."
                })
            }
        }catch(e){
            return res.status(500).send({
                success: false,
                data: null,
                statusCode: 500,
                msg: "Could not add category. Internal Server Error."
            })
       }
    }
}).put("/:id",async (req,res) => {
    const categoryID = req.params.id
    if(!isValidObjectId(categoryID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Category ID"
        })
        
    try {
        const exists = await Category.exists({_id : categoryID})
        if(!exists){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find category with id " + categoryID 
            })
        }
        if(exists){
            const  updatedCategory = await Category.findByIdAndUpdate(categoryID ,{...req.body}, {new: true})
            return res.status(200).send({
                success: true,
                data: [updatedCategory],
                statusCode: 200,
                msg: "Category updated."
            })
        }
    } catch (error) {
        await decrementSequence(CONSTANTS.MODEL.CAR.CATEGORY)
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update category with id " + categoryID
        })
    }
}).delete("/:id",async (req,res) => {
    const categoryID = req.params.id
    if(!isValidObjectId(categoryID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Category ID"
        })
    try {
        const result = await Category.findByIdAndDelete(categoryID)
        if(result){
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Category deleted."
            })
        }
        if(!result){
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find category with id " + categoryID
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete category with id " + categoryID
        })
    }
})

module.exports = router