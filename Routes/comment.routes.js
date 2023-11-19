const express = require('express');
const router = express.Router();
const {
    index,
    show,
    showChildComments,
    createCommentInVideo,
    createCommentInComment,
    update,
    destroy
} = require('../Controllers/comment.controller');

const imageUpload = require("../config/imageUpload");
const {loginRequired} = require('../Controllers/channels.controller')



router
    .get('/', index)
    .get('/:id', show)
    .get('/:id/children', showChildComments)
    .post('/:commentId/create', [loginRequired, imageUpload.none()], createCommentInComment)
    .post('/video/:videoId/create', [loginRequired, imageUpload.none()], createCommentInVideo)
    .put('/:id/update', [loginRequired, imageUpload.none()], update)
    .delete('/:id/delete', [loginRequired, imageUpload.none()], destroy);


module.exports = router;