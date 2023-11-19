const {Schema, model, ObjectId} = require('mongoose');
const {faker} = require('@faker-js/faker');

const videoSchema = new Schema({
    title: String,
    url: { type: String, required: true },
    tag: String,
    description: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    views: {type: Number, default: 0},
    duration: {type: Number, default: 0},
    thumbnail: { type: String, default: faker.image.url({
        height: 480,
        width: 640
      })},
    comments: [
        { 
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    channel: { type: ObjectId, ref: 'Channel', required: true},
}, {
    timestamps: true
});

module.exports = model('Video', videoSchema);