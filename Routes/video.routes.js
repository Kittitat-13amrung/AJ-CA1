const express = require('express');
const router = express.Router();
const {
    index,
    show,
    create,
    update,
    destroy
} = require('../Controllers/video.controller');

const {loginRequired} = require('../Controllers/channels.controller');
const imageUpload = require('../config/imageUpload');




router
    .get('/', index)
    .get('/:id', show)
    .post('/create', [loginRequired, imageUpload.single('image')], create)
    .put('/:id/update', loginRequired, update)
    .delete('/:id/delete', loginRequired, destroy);


module.exports = router;