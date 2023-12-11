const multer = require('multer');
const multers3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    region: process.env.S3_REGION
})

const s3Storage = multers3({
    s3: s3,
    bucket: "advanced-js",
    acl: "public-read",
    metadata: (req, file, cb) => {
        cb(null, {
            fieldname: file.fieldname
        })
    },
    key: (req, file, cb) => {
        const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname; 
        cb(null, fileName)
    }
});

function validateFile(file, cb) {
    // define allowed extension
    // const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];

    // // check uplodaded file extension
    // const isExt = fileExts.includes(
    //     path.extname(file.originalname.toLowerCase())
    // );

    // Mime type must be an image
    const isMimeType = file.mimetype.startsWith("image/");

    if(isMimeType) {
        return cb(null, true); //no errors
    } else {
        // pass error msg to callback
        console.log(file)
        cb('Error: File type not allowed!');
    }
}

// image middleware
const uploadImage = multer({
    storage: s3Storage,
    fileFilter: (req, file, cb) => {
        validateFile(file, cb)
    },
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb file size
    }
});

// // file validation
// const fileFilter = async(req, file, cb) => {
//     if(!file) {
//         req.imageError = "Image not uploaded";
//         return cb(null, false);
//     } else if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//         req.imageError = "Image must be jpg|jpeg|png|gif";
//         return cb(null, false);
//     } else {
//         return cb(null, true);
//     }
// };

// // store file in a folder
// const storage = multer.diskStorage({
//     destination: function(res, file, cb) {
//         cb(null, 'public/uploads')
//     },
//     filename: function(res, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// });


module.exports = uploadImage;