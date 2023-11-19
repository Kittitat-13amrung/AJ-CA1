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

const {loginRequired} = require('../Controllers/channels.controller')



router
    .get('/', index)
    .get('/:id', show)
    .get('/:id/children', showChildComments)
    .post('/:commentId/create', loginRequired, createCommentInComment)
    .post('/video/:videoId/create', loginRequired, createCommentInVideo)
    .put('/:id/update', loginRequired, update)
    .delete('/:id/delete', loginRequired, destroy);


module.exports = router;