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
    .post('/register', imageUpload.single("avatar"),register)
    .post('/login', imageUpload.none(),login)
    .get('/:id', imageUpload.none(), show)
    .put('/update', [loginRequired, imageUpload.single("avatar")], update)
	.delete("/delete", [loginRequired, imageUpload.none()], destroy);


module.exports = router;