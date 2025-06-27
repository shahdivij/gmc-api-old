const Package = require('../../models/package/package.model')
const Cluster = require('./../../models/cluster/cluster.model')
const Customer = require('./../../models/customer/customer.model')
const Customer_Car = require('./../../models/customer_car/')
const { body } = require('express-validator')
const { isValidMongoObjectID, checkDocumentExists } = require('./../../utility/commonValidators')
const { verifyAccessToken } = require('../../utility/common_api_functions')

const bodyValidators = () => {
    return [
        body('cluster').trim().notEmpty().custom(async (value) => {
            if(!isValidMongoObjectID(value)) throw new Error("Invalid cluster ID")
            if(!checkDocumentExists(Cluster, { _id: value })) throw new Error("Cluster does not exist with this cluster ID.")
        }),
        body('package').trim().notEmpty().custom(async (value) => {
            if(!isValidMongoObjectID(value)) throw new Error("Invalid Package ID")
            if(!checkDocumentExists(Package, { _id: value })) throw new Error("Package does not exist with this package ID.")
        }),
        body('customer').trim().notEmpty().custom(async (value) => {
            if(!isValidMongoObjectID(value)) throw new Error("Invalid Customer ID")
            if(!checkDocumentExists(Customer, { _id: value })) throw new Error("Customer does not exist with this customer ID.")
        }),
        body('car').trim().notEmpty().custom(async (value) => {
            if(!isValidMongoObjectID(value)) throw new Error("Invalid Car ID")
            if(!checkDocumentExists(Customer_Car, { _id: value })) throw new Error("Car does not exist with this car ID.")
        }),
        body('house_flat_number').trim().notEmpty().withMessage("House/Flat number is required."),
        body('parking_lot_number').trim().notEmpty().withMessage("Parking lot number is required."),
        body('data_token').trim().custom(async value => {
            if(!value) throw new Error("Data token is required.")
            const verified = await verifyAccessToken(value)
            if(!verified) throw new Error("Invalid data token is passed.")
            if(!(verified.first_car_price && verified.total_payable && verified.net_price && verified.net_payable && verified.customer && verified.car && verified.package)) {
                throw new Error("Data token is missing values.")
            }
        })
    ]
}

module.exports = {
    bodyValidators
}