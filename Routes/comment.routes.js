const express = require('express');
const router = express.Router();
const {
    index,
    show,
    createCommentInVideo,
    createCommentInComment,
    update,
    destroy
} = require('../Controllers/comment.controller');

const {loginRequired} = require('../Controllers/channels.controller')



router
    .get('/', index)
    .get('/:id', show)
    .post('/:commentId/create', loginRequired, createCommentInComment)
    .post('/video/:videoId/create', loginRequired, createCommentInVideo)
    .put('/:id', loginRequired, update)
    .delete('/:id', loginRequired, destroy);


module.exports = router;