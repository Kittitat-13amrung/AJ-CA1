const {Schema, model, ObjectId} = require('mongoose');

const commentSchema = new Schema({
    _channel_id:  { type: ObjectId, ref: 'Channel', require: true},
    _video_id: {type: ObjectId, ref: 'Video'},
    body: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    _parent_comment_id: { type: ObjectId, ref: 'Comment', required: false}
}, {
    timestamps: true
});

module.exports = model('Comment', commentSchema);