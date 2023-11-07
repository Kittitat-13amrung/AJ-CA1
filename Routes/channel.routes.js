const express = require('express');
const router = express.Router();
const {
    register,
    login,
    loginRequired,
    profile,
    update
} = require('../Controllers/channels.controller');



router
    .get('/', profile)
    .post('/register', register)
    .post('/login', login)
    .get('/profile/', loginRequired, profile)
    .post('/profile/:id/update', loginRequired, update)

module.exports = router;