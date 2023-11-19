// const fs = require('fs');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    region: process.env.S3_REGION
})

async function deleteImage(filename) {
    const object = {
        "Bucket": 'advanced-js',
        "Key": filename
    };
    
    const req = new DeleteObjectCommand(object);

    await s3.send(req);
}


// delete image function
// function deleteImage(filename) {
//     fs.unlink(`./public/uploads/${filename}`, (err) => {
//         if (err) {
//             return console.error(err);
//         }

//         return "Successfully deleted the image";
//     });
// };

module.exports = deleteImage;