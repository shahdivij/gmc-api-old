const express = require('express')
const router = express.Router()

const RequesterRole = require('./../../../models/cluster/requests/requester_roles.model')
const { isValidObjectId } = require('mongoose')
const ClusterRequest = require('../../../models/cluster/requests/request.model')
const { getNextSequence } = require('../../../utility/common_api_functions')
const CONSTANTS = require("./../../../utility/constants")

router.get("/", async (req, res) => {
    const requests = await ClusterRequest.find().populate("residence_type").populate('requester_role').exec()
    return res.status(200).send({
        data: requests,
        msg: "Car Cluster Requests Data.",
        statusCode: 200,
        success: true
    })
}).post("/", async (req, res) => {
    if(!req.body){
        return res.status(409).json({
            data: null,
            statusCode: 409,
            msg: "Bad Request.",
            success: false
        })
    }
    const data = req.body
    console.log(data)
    const customerName = data.requester_name
    const address = data.address
    const mobileNumber = data.mobile_number
    const comment = data.comment
    const residenceType = data.residence_type
    const role = data.requestor_role
    const clusterPicture = data.cluster_picture
    const clusterName = data.cluster_name
    const clusterID = data.cluster_id
    const clusterDB_ID = data.cluster_db_id

    const validResidenceType = await isValidObjectId(residenceType)
    if(!validResidenceType){
        return res.status(409).json({
            data: null,
            msg: "Invalid Residence ID.",
            statusCode: 409,
            success: false
        })
    }
    
    const validRoleType = await isValidObjectId(role)
    if(!validRoleType){
        return res.status(409).json({
            data: null,
            msg: "Invalid Role ID.",
            statusCode: 409,
            success: false
        })
    }

    try {
        const reqID = await getNextSequence(CONSTANTS.MODEL.CLUSTER.REQUEST)
        const newClusterReq = new ClusterRequest({
            cluster_name: clusterName,
            requester_name: customerName,
            mobile_number: mobileNumber,
            address: address,
            comment: comment,
            residence_type: residenceType,
            requester_role: role,
            cluster_picture: clusterPicture,
            request_id: reqID,
            cluster_id: clusterID,
            cluster_db_id: clusterDB_ID
        })
    
        const saved = await  newClusterReq.save()
        return res.status(200).json({
            data: saved,
            msg: "New Cluster Request Added Successfully.",
            statusCode: 200,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            data: null,
            msg: "Internal Server Error.",
            statusCode: 500,
            success: false
        })
    }

    

}).put("/:id", async (req, res) => {
    return res.send("request")
}).delete("/:id", async (req, res) => {

})

router.get("/role", async (req, res) => {
    const roles = await RequesterRole.find()
    return res.status(200).json({
        data: roles,
        message: "Roles retrieved successfully",
        success: true,
        statusCode: 200
    })
}).post("/role", async (req, res) => {
    const roleData = req.body
    if(!roleData){
        return res.status(400).json({
            data: null,
            success: false,
            msg: "Bad Request. Provide Role data.",
            statusCode: 400
        })
    }

    try {
        let roleName = roleData.name.toString().trim().toLowerCase()
        roleName = roleName[0].toUpperCase() + roleName.slice(1)
        const exists = await RequesterRole.exists({name: roleName})
        if(exists){
            return res.status(409).json({
                data: null,
                msg: "Role already exists. Can not add duplicate.",
                success: false,
                statusCode: 409
            })
        }
    
        const newRole = new RequesterRole({
            ...roleData
        })
    
        const saved = await newRole.save()
        if(saved)
            return res.status(200).json({
                data: [saved],
                msg: "Requester role added successfully.",
                statusCode: 200, 
                success: true
            })
    } catch (error) {
        return res.status(500).json({
            data: null,
            msg: "Internal Server Error. Could not add Requester Role.",
            statusCode: 500, 
            success: false
        })
    }

}).put("/role/:id", async (req, res) => {
    const roleData = req.body
    const roleID = req.params.id
    if(!roleData){
        return res.status(400).json({
            data: null,
            success: false,
            msg: "Bad Request. Provide Role data.",
            statusCode: 400
        })
    }

    if(!isValidObjectId(roleID))
        return res.status(400).json({
            success: false,
            data: null,
            statusCode: 400,
            msg: "Invalid Role ID"
        })

    try {
        const exists = await RequesterRole.exists({_id: roleID})
        if(!exists){
            return res.status(409).json({
                data: null,
                msg: "Role does not exist.",
                success: false,
                statusCode: 409
            })
        }
    
        const updated = await RequesterRole.findOneAndUpdate({_id: roleID}, {...roleData}, {new: true})

        if(updated)
            return res.status(200).json({
                data: [updated],
                msg: "Requester role updated successfully.",
                statusCode: 200, 
                success: true
            })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            data: null,
            msg: "Internal Server Error. Could not update Requester Role.",
            statusCode: 500, 
            success: false
        })
    }
}).delete("/role/:id", async (req, res) => {
    const roleID = req.params.id
    if(!isValidObjectId(roleID)){
        return res.status(400).json({
            data: null, 
            success: false,
            statusCode: 400,
            mag: "Bad Request. Invalid Role ID."
        })
    }
    
    try {
        const exists = await RequesterRole.exists({_id: roleID})
        if(!exists){
            return res.status(409).json({
                data: null, 
                success: false,
                statusCode: 409,
                mag: "Requester Role does not exist with ID " + roleID
            })
        }
        
        const deleted = await RequesterRole.findByIdAndDelete(roleID)
        if(deleted){
            return res.status(200).json({
                data: [deleted], 
                success: true,
                statusCode: 200,
                mag: "Requester Role deleted for role ID" + roleID
            })
        }
    } catch (error) {
        return res.status(500).json({
            data: null, 
            success: false,
            statusCode: 500,
            mag: "Internal Server Error. Could not delete Role with ID " + roleID
        })
    }
})


module.exports = router