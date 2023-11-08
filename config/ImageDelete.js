const fs = require('fs');

function deleteImage(filename) {
    fs.unlink(`./public/uploads/${filename}`, (err) => {
        if (err) {
            return console.error(err);
        }

        return "Successfully deleted the image";
    });
};

module.exports = deleteImage;