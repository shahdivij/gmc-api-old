const express = require('express');
const Brand = require('../../../models/car/car_brand.model');
const { isValidObjectId } = require('mongoose');
const { getNextSequence, decrementSequence } = require('../../../utility/common_api_functions');
const router = express.Router()
const CONSTANTS = require('./../../../utility/constants');
const IDs = require('../../../models/ids/ids.model');

router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find().populate('models').populate({
            path: 'models',
            populate: 'category'
        }).exec()
        return res.status(200).send({
            success: true,
            statusCode: 200,
            data: brands,
            msg: "Ok"
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            statusCode: 500,
            data: null,
            msg: "Internal Server Error."
        })
    }
}).post("/", async (req, res) => {
    // console.log("POST car brand", req.body);
    let brandData = req.body
    if (brandData) {
        if (!brandData.name || !brandData.logo || !brandData.logo.name || !brandData.logo.image_data) {
            return res.status(400).send({
                success: false,
                statusCode: 400,
                data: null,
                msg: "Bad request. Please provide all the required information."
            })
        }
        try {
            let brand_name = brandData.name.toLowerCase().trim()
            brand_name = brand_name[0].toUpperCase() + brand_name.slice(1);

            const brand_logo_name = brandData.logo.name
            const brand_logo_image_data = brandData.logo.image_data


            // Check if brand already exists in the system
            let brand = await Brand.exists({ name: brand_name })
            if (brand) {
                return res.status(409).send({
                    success: false,
                    statusCode: 409,
                    data: null,
                    msg: "Brand already exists. Can not add duplicate"
                })
            }

            const brand_id = await getNextSequence(CONSTANTS.MODEL.CAR.BRAND);
            console.log(brand_id);
            if (!brand_id) {
                console.log("Initializing sequence for brand");
                await IDs.updateOne({}, { $set: { [CONSTANTS.MODEL.CAR.BRAND]: 0 } });
                console.log(CONSTANTS.MODEL.CAR.BRAND);
                brand_id = await getNextSequence(CONSTANTS.MODEL.CAR.BRAND);

            }

            // If brand_id is still not available, throw an error
            if (!brand_id) {
                throw new Error('Failed to generate brand ID after initialization.');
            }

            brand = new Brand({
                name: brand_name,
                brand_id: brand_id,
                logo: {
                    name: brand_logo_name,
                    image_data: brand_logo_image_data
                }
            })

            
            const result = await brand.save()
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Brand added successfully."
            })
        } catch (e) {
            await decrementSequence(CONSTANTS.MODEL.CAR.BRAND)
            return res.status(500).send({
                success: false,
                data: null,
                statusCode: 500,
                msg: "Could not add Brand. Internal Server Error."
            })
        }
    }
}).put("/:id", async (req, res) => {
    const brandID = req.params.id
    if (!isValidObjectId(brandID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid brand ID"
        })

    try {
        const exists = await Brand.exists({ _id: brandID })
        if (!exists) {
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Brand with id " + brandID
            })
        }
        if (exists) {
            const updatedbrand = await Brand.findByIdAndUpdate(brandID, { ...req.body }, { new: true })
            return res.status(200).send({
                success: true,
                data: [updatedbrand],
                statusCode: 200,
                msg: "Brand updated."
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not update Brand with id " + brandID
        })
    }
}).delete("/:id", async (req, res) => {
    const brandID = req.params.id
    if (!isValidObjectId(brandID))
        return res.status(400).send({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Brand ID"
        })
    try {
        const result = await Brand.findByIdAndDelete(brandID)
        if (result) {
            return res.status(200).send({
                success: true,
                data: [result],
                statusCode: 200,
                msg: "Brand deleted."
            })
        }
        if (!result) {
            return res.status(404).send({
                success: false,
                data: null,
                statusCode: 404,
                msg: "Could not find Brand with id " + brandID
            })
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            data: null,
            statusCode: 500,
            msg: "Internal Server Error. Could not delete Brand with id " + brandID
        })
    }
})

module.exports = router