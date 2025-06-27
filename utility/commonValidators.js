const mongoose = require('mongoose');

const isValidMongoObjectID = async (object_id) => mongoose.Types.ObjectId.isValid(object_id)
const checkDocumentExists = async (modelObject, condition) => await modelObject.exists(condition)

module.exports = {
    isValidMongoObjectID,
    checkDocumentExists
}
