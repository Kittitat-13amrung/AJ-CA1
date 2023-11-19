const express = require('express');
const router = express.Router();
const {
    register,
    login,
    loginRequired,
    show,
    update,
    destroy
} = require('../Controllers/channels.controller');

const imageUpload = require("../config/imageUpload");


router
    .post('/register', imageUpload.single("image"),register)
    .post('/login', login)
    .get('/:id', show)
    .put('/:id/update', loginRequired, update)
	.delete("/delete", loginRequired, destroy);


module.exports = router;