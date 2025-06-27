const { getStatusString } = require("./status")

const response = (resObject, success, msg_, statusCode, data_, errors_) => {
    const data = data_ || []
    const errors = errors_ || {}
    const msg = msg_ || getStatusString(statusCode)

    if(data.length > 0) {
        return resObject.status(statusCode).json({
            success: success,
            data: data,
            msg: msg,
            statusCode: statusCode
        })
    } else if (Object.keys(errors).length > 0) {
        return resObject.status(statusCode).json({
            success: success,
            statusCode: statusCode,
            msg: msg,
            errors: [...errors]
        })
    }
}

module.exports = { response }