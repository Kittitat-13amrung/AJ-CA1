const {Schema, model, ObjectId} = require('mongoose');
const {faker} = require('@faker-js/faker')
const bcrypt = require('bcryptjs');

const channelSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, unique: true, trim: true, required: true, lowercase: true},
    password: { type: String, required: true},
    subscribers: { type: Number, default: 0 },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    about: { type: String },
    avatar: { type: String, default: faker.image.avatar()},
    roles: [{ type: String, default: 'user', }]
}, {
    timestamps: true
});

channelSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = model('Channel', channelSchema);