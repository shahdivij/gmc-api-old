const mongoose = require('mongoose')
const CONSTANT = require('../../utility/constants') 

const refreshTokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expires_in: {
        type: mongoose.Schema.Types.Date,
        required: true,
    }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const RefreshToken = mongoose.model(CONSTANT.MODEL.REFRESH_TOKEN, refreshTokenSchema)

module.exports = RefreshToken