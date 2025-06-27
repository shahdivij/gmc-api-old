const { body, param } = require("express-validator")
const { isValidObjectId } = require("../../../utility/common_api_functions")

const addressQueryValidators = () => {
    return [
        param("id").trim().custom(async value => {
            if(!value) throw new Error("Customer ID is required.")
            if(value && !isValidObjectId(value)) throw new Error("Customer ID is not valid.")
        }),
        // query("addressID").trim().custom(async value => {
        //     if(!value) throw new Error("addressID ID is required.")
        //     if(value && !isValidObjectId(value)) throw new Error("addressID ID is not valid.")
        // }),
    ]
}

const addressBodyValidators = () => {
    return [
        body("other_name").optional(),
        body("address_type").trim().custom(async value => {
            if(!["HOME", "OFFICE", "OTHER"].includes(value)) throw new Error("Address Type is empty or invalid. It should be one of these : HOME, OFFICE and OTHER.")
        }),
        body("house_flat_no").optional(),
        body("line_1").trim().notEmpty(),
        body("line_2").optional(),
        body("area").trim().notEmpty(),
        body("city").trim().notEmpty(),
        body("state").trim().notEmpty(),
        body("country").trim().notEmpty(),
        body("zip_code").trim().notEmpty(),
        body("locked").trim().optional(),
        body("cluster_id").trim().optional(),
        body("cluster_db_id").trim().optional(),
        body("cluster_name").trim().optional(),
    ]
}

module.exports = {
    addressQueryValidators,
    addressBodyValidators
}