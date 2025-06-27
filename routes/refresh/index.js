const express = require('express')
const { checkToken, getAccessToken } = require('../../utility/common_api_functions')
const RefreshToken = require('../../models/refresh_token/refresh_token.model')
const { STATUS_CODE, getStatusString } = require('./../../utility/status')

const router = express.Router()

router.post('/', checkToken, async (req, res) => {
    const refreshToken = req.token

    try {
        const decodedToken = await verifyAccessToken(token)
        console.log(decodedToken)

        const tokenExists = await RefreshToken.exist({token: refreshToken})

        if(!tokenExists){
            return res.status(STATUS_CODE.UNAUTHORIZED).json({
                success: false,
                statusCode: STATUS_CODE.UNAUTHORIZED,
                msg: "Invalid Refresh Token. Please login again.",
                data: null,
                error: true
            }) 
        }

        const newAccessToken = await getAccessToken({...decodedToken}, { expiresIn: '1h' })
        return res.status(STATUS_CODE.OK).json({
            success: true,
            statusCode: STATUS_CODE.OK,
            msg: "New Access Token created.",
            data: [{
                access_token: newAccessToken
            }],
            error: false
        }) 
        
        
    } catch (error) {
        console.log(error)
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            success: false,
            statusCode: STATUS_CODE.INTERNAL_ERROR,
            msg: getStatusString(STATUS_CODE.INTERNAL_ERROR),
            data: null,
            error: true
        }) 
    }

})

module.exports = router