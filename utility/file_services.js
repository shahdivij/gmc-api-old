const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('../config/aws_config');

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        metadata: (req, rescb) => {
            cb(null, { fieldName: file.fieldName });
        },
        key: (req, file, cb) => {
            // TODO: add unique name using the sequence number and uuid
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
        fileFilter: function (req, file, cb) {
            // Filter only images
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Invalid file type, only images are allowed!'), false);
            }
            cb(null, true);
        }
    })
})
// Function to generate pre-signed URL for an image
const generatePresignedUrl = (key) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        // Expires: 60 * 60 // using this will generate the url with expirey time
    };
    return s3.getSignedUrl('getObject', params);
};

// Function to upload a single image
const uploadImage = async (req, res) => {
    upload.single('image')(req, res, function (error) {
        if (error) {
            return res.status(400).json({ success: false, msg: error.message });
        }
        const fileUrl = req.file.location;
        const presignedUrl = generatePresignedUrl(req.file.key);

        res.status(200).json({
            success: true,
            msg: 'Image uploaded successfully',
            data: {
                url: fileUrl,
                previewUrl: presignedUrl
            }
        });
    });
};

module.exports = {
    uploadImage,
    generatePresignedUrl
};
