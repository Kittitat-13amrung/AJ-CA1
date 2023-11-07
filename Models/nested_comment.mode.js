const { Schema, ObjectId, model } = mongoose;

const replySchema = new Schema({
    _comment_id: { type: ObjectId, require: true},
    body: String,
    _channel_id:  { type: ObjectId, require: true},
    likes: { type: Number, default: 0},
    dislikes: { type: Number, default: 0},
}, {
    timestamps: true
});

module.exports = model('Reply', replySchema);