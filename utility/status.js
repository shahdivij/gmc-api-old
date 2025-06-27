const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHENTICATED: 401,
    UNAUTHORIZED: 403,
    NOT_FOUND: 404,
    ALREADY_EXIST: 409,
    INTERNAL_ERROR: 500
}

const STATUS_STRING = {
    200: 'OK',
    201: 'Resource created.',
    400: 'Bad request.',
    401: 'Authentication required.',
    403: 'Unauthorized access.',
    404: 'Resource not found.',
    409: 'Resource already exists.',
    500: 'Internal Server Error.'
}

const getStatusCode = (statusString) => STATUS_CODE[statusString] || null
const getStatusString = (statusCode) => STATUS_STRING[statusCode] || null

module.exports = {
    STATUS_CODE,
    STATUS_STRING,
    getStatusCode,
    getStatusString
}
