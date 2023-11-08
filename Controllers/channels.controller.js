const Channel = require('../Models/channel.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = (req, res) => {
    const newChannel = new Channel(req.body);

    newChannel.password = bcrypt.hashSync(req.body.password, 10);

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

const show = (req, res) => {
    Channel.findOne({ _id: req.params.id }).populate([
        {
            path: 'videos',
            select: '_id title url tag thumbnail duration createdAt views',
        }
    ])
    .then(channel => {
        if(!channel) {
            return res.status(404).json({
                message: 'Channel does not exist!'
            });
        }

        channel.password = undefined;

        return res.status(200).json(channel)
    })
};

const update = (req, res) => {
    let form = req.body;
    const id = req.params.id;

    console.log(id)

    if(req.file) {
        form.thumbnail = req.file.filename;
    }

    Channel.exists({ _id: id })
    .then(channelId => {
        Channel.findByIdAndUpdate(channelId, form)
        .then(updatedData => {
            console.log(`Channel has been updated`, updatedData);

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
    })
    .catch(err => {
        console.error(err);
    })
};

// const destroy = (req, res) => {
//     const id = req.
// }

module.exports = {
    register,
    login,
    loginRequired,
    show,
    update
}