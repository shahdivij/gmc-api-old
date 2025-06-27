const express =  require('express');
const Model = require('../../../models/car/car_model.model');
const { isValidObjectId } = require('mongoose');
const router = express.Router()
const Category = require('./../../../models/car/category.model')
const Brand = require('./../../../models/car/car_brand.model')
const mongoose = require('mongoose');
const { getNextSequence, decrementSequence } = require('../../../utility/common_api_functions');
const CONSTANTS  = require("../../../utility/constants");

router.get('/', async (req, res) => {
    try {
        const models = await Model.find().populate('category').populate('brand').exec()
        return res.status(200).json({
            success: true,
            statusCode: 200,
            data: models,
            msg: "Car models data"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        })
    }
}).post("/", async (req,res) => {
    const modelData = req.body
    let session
    if (!modelData) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        data: null,
        msg: "Bad request.",
      });
    }
    const categoryID = modelData.category;
    const brandID = modelData.brand;
    let modelName = modelData.name.toLowerCase().trim();
    modelName = modelName[0].toUpperCase() + modelName.slice(1)
    try {
      const categoryExist = await Category.exists({ _id: categoryID });
      const brandExist = await Brand.exists({ _id: brandID });
      const modelExist = await Model.exists({ name: modelName });
      if (!categoryExist){
          return res.status(404).json({
            statusCode: 404,
            success: false,
            data: null,
            msg: "Invalid category type ID.",
          });
      }
      if (!brandExist){
          return res.status(404).json({
            statusCode: 404,
            success: false,
            data: null,
            msg: "Invalid brand type ID.",
          });
      }
      if (modelExist){
          return res.status(404).json({
            statusCode: 404,
            success: false,
            data: null,
            msg: "Car Model already exists. Can not add duplicate.",
          });
      }
      session = await mongoose.startSession()
      await session.startTransaction()
      const model_id = await getNextSequence(CONSTANTS.MODEL.CAR.MODEL)
      const model = new Model({ ...modelData, model_id: model_id });
      const result = await model.save({session: session});
      const brand = await Brand.findByIdAndUpdate(brandID, {$push: {models: model._id}}, {new: true}, {session: session})
   
      await session.commitTransaction()
      return res.status(200).json({
        statusCode: 200,
        success: true,
        data: [result],
        msg: "Car Model added successfully.",
      });
    } catch (error) {
        await decrementSequence(CONSTANTS.MODEL.CAR.MODEL)
        await session.abortTransaction();
        return res.status(500).json({
        statusCode: 500,
        success: false,
        data: null,
        msg: "Could not add Car model .Internal Server Error.",
      });
    }
}).put("/:id",async (req,res) => {
    const modelID = req.params.id
    if(!isValidObjectId(modelID))
        return res.status(400).json({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Model ID"
        })
        
    try {
        const exists = await Model.exists({_id : modelID})
        if(!exists){
            return res.status(404).json({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Model with id " + modelID 
            })
        }
        if(exists){
            const  updatedModel = await Model.findByIdAndUpdate(modelID ,{...req.body}, {new: true})
            return res.status(200).json({
                success: true,
                data: [updatedModel],
                statusCode: 200,
                msg: "Car Model updated."
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Car Model with id " + modelID
        })
    }
}).delete("/:id",async (req,res) => {
    const modelID = req.params.id
    if(!isValidObjectId(modelID))
        return res.status(400).json({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Model ID"
        })
    let session
    try {
        session = await mongoose.startSession()
        await session.startTransaction()
        const modelData = await  Model.findOne({_id : modelID})
        await Brand.findByIdAndUpdate(modelData.brand, {$pull: {models: modelID}}, {new: true})
        
        const result = await Model.findByIdAndDelete(modelID)
        if(result){
            return res.status(200).json({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Car Model deleted."
            })
        }
        if(!result){
            return res.status(404).json({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Car Model with id " + modelID
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete Car Model with id " + modelID
        })
    }
})

module.exports = router