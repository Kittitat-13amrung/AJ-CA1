const Channel = require('../Models/channel.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = (req, res) => {
    const newChannel = new Channel(req.body);

    newChannel.password = bcrypt.hashSync(req.body.password, 10);

    console.log(newChannel);

    let err = newChannel.validateSync();

    if(err) {
        console.error(err);
        return res.status(500).json(err);
    }

    newChannel.save()
    .then((channel) => {
        channel.password = undefined;
        return res.status(201).json({
            data: channel
        });
    })
    .catch(err => {
        return res.status(400).json({
            msg: err
        });
    });
};

const login = (req, res) => {
        const credential = req.body;

        console.log(credential);

        Channel.findOne({ email: credential.email })
        .then(channel => {
            if(!channel || !credential.password || !channel.comparePassword(credential.password)) {
                return res.status(401).json({
                    msg: "Authentication failed. Invalid channel or password"
                });
            }

            let token = jwt.sign({ 
                email: channel.email,
                username: channel.username,
                _id: channel._id
             }, process.env.JWT_SECRET)

            return res.status(200).json({
                token 
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(404).json(err)   
        });

};

const loginRequired = (req, res, next) => {
    console.log(req.channel)
    if(req.channel) return next();

    return res.status(401).json({msg: 'Unauthorised channel!'});
}

const profile = (req, res) => {
    Channel.findOne({ _id: req.params.id }).populate([
        {
            path: 'videos',
        }
    ])
    .then(channel => {
        if(!channel) {
            return res.status(404).json({
                message: 'Channel does not exist!'
            });
        }

        return res.status(200).json(channel)
    })
};

const update = (req, res) => {
    let form = req.body;

    if(req.file) {
        form.thumbnail = req.file.filename;
    }
    // include the following else if image is required
    else {
        return res.status(422).json({
            message: 'Image not uploaded!'
        })
    }


    Channel.findByIdAndUpdate({ _id : res.params.id }, form)
    .then(updatedData => {
        console.log(`Channel has been updated`, data);

        res.status(201).json(updatedData)
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            res.status(422).json({
                errors: err.errors
            });
        } else {
            console.error(err);

            res.status(500).json(err)
        };
    });
};

module.exports = {
    register,
    login,
    loginRequired,
    profile,
    update
}