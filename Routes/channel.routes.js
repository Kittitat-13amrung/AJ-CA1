const express = require('express');
const router = express.Router();
const {
    register,
    login,
    loginRequired,
    show,
    update
} = require('../Controllers/channels.controller');



router
    // .get('/', show)
    .post('/register', register)
    .post('/login', login)
    .get('/:id', show)
    .put('/:id/update', loginRequired, update)

module.exports = router;