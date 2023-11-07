const express = require('express');
require('dotenv').config();
require('./config/db')();
const jwt = require('jsonwebtoken');

const app = express();

const port = 3000;

app.use(express.json());

app.set('view engine', 'html');
app.use(express.static(__dirname + '/views/'));

// login middleware
app.use((req, res, next) => {
    const securePaths = ['update', 'create', 'delete'];
    // console.log(for(const path of req.path.split('/')) {})
    let itr = false;
    for(const path of req.path.split('/')) {

        for(const checkPath of securePaths) {
            if(checkPath === path) itr = true;
        }

    }

    if(!itr) return next();

    let token = null;
    if(req.headers.authorization) {
        token = req.headers.authorization.split(' ');
    }

    console.log(token)

    if(token && token[0] === 'Bearer') {
        // verify token is valid
        jwt.verify(token[1], process.env.JWT_SECRET, (err, decoded) => {
            // console.log(token[], process.env.JWT_SECRET)
            if(err) {
                console.log(err);
                req.channel = undefined;
            }

            req.channel = decoded;

            return next();
        });

    } else {
        console.log('No token');

        req.channel = undefined;

        return res.status(401).json({
            message: "No token"
        })
    }
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// Channels Route
app.use('/api/channels', require('./Routes/channel.routes'));
// Videos Route
app.use('/api/videos', require('./Routes/video.routes'));
//  Comments Route
app.use('/api/comments', require('./Routes/comment.routes'));

app.listen(port, (req, res) => {
    console.log(`Example app listening on port ${port}`);
})