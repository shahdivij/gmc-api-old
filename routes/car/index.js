const express = require("express");

const router = express.Router();

const categoryRoutHandler = require("./category");
const fuelRoutHandler = require("./fuel");
const registrationRoutHandler = require("./registration");
const transmissionRoutHandler = require("./transmission");
const brandRoutHandler = require("./brand");
const modelRoutHandler = require('./model');
const Brand = require("../../models/car/car_brand.model");

router
  .get("/", async (req, res) => {
    const result = await Brand.find().populate({
        path: "models",
        populate: {path: 'category'},
        select: ['name', 'value']
    }).exec()   
    return res.status(200).send({
        success: true,
        msg: "Car models brand wise.",
        data: result,
        statusCode: 200
    })
  })
  .post("/", async (req, res) => {
      return res.send(`Adds a car.`)
  })
  .put("/:id", (req, res) => {
    return res.send(`Updates a car with id ${req.params.id}`)
  })
  .delete("/:id", (req, res) => {
    return res.send(`Deletes a car with id ${req.params.id}`)
  });

router.use("/category", categoryRoutHandler)
router.use("/fuel", fuelRoutHandler)
router.use("/registration", registrationRoutHandler)
router.use("/transmission", transmissionRoutHandler)
router.use("/brand", brandRoutHandler)
router.use("/model", modelRoutHandler)

module.exports = router
