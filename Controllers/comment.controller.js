const Comment = require('../Models/comment.model');
const Video = require('../Models/video.model');

const index = (req, res) => {
    const limit = req.query.limit | 5;

    Comment.find().populate([
        {
            path: '_channel_id',
        },
        {
            path: '_parent_comment_id',
        },
        {
            path: '_video_id',
            select: ['_id', 'title', 'url']
        }
    ]).limit(limit)
    .then(data => {
        console.log(data);

        if(data.length > 0) {
            res.status(200).json(data);
        } else {
            res.status(404).json({
                message: "None Found"
            });
        };
    })
    .catch(err => {
        console.error(err);
        res.status(500).json(err);
    });

};

const show = (req, res) => {
    const id = req.params.id;

    Comment.findById(id).populate([
        {
            path: '_channel_id',
        },
        {
            path: '_parent_comment_id',
        },
        {
            path: '_video_id',
            select: ['_id', 'title', 'url']
        }
    ])
    .then(comment => {
        if(!comment) res.status(404).json({
            message: `Comment ${id} not found!`
        });

        res.status(200).json(comment);
    })
    .catch(err => {
        if(err.name === 'CastError') {
            console.error(err);
            res.status(404).json({
                message: `Comment ${id} not found!`
            });
        } else {
            console.error(err);
            res.status(500).json(err);
        }
    })
}

const createCommentInVideo = (req, res) => {
    let form = req.body;

    let videoId = req.params.videoId

    form._video_id = videoId;

    Comment.create(form)
    .then(data => {
        console.log(`New Comment Created`, data);

        Video.findByIdAndUpdate({ _id: videoId }, {
            $push: {
                'comments': data._id
            }
        })

        res.status(201).json(data)
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

}

const createCommentInComment = async(req, res) => {
    let form = req.body;

    let commentId = req.params.commentId

    form._video_id = await Comment.findById({ _id: commentId })._video_id;
    form._parent_comment_id = commentId;


    Comment.create(form)
    .then(data => {
        console.log(`New Comment Created`, data);

        Video.findByIdAndUpdate({ _id: form._video_id }, {
            $push: {
                'comments': data._id
            }
        });

        res.status(201).json(data)
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

}

const update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

     //connect to model and retrieve comment with specified id
     Comment.findByIdAndUpdate(id, data, {
        new: true
     })
     .then(updatedData => {
        res.status(201).json(updatedData);
     })
     .catch(err => {
        if(err.name === 'ValidationError') {
            res.status(422).json({
                errors: err.errors
            })
        } else if(err.name === 'CastError') {
            console.error(err);

            res.status(404).json({
                message: `Comment with ID ${id} Not Found`
            })
        }
     });
}

const destroy = (req, res) => {
    let id = req.params.id;

    Comment.findByIdAndDelete(id)
    .then(data => {
        if(!data) {
            res.status(404).json({
                message: `Comment ${id} not found!`
            });
        } else {

            Video.findByIdAndUpdate({ _id: data._video_id }, {
                $pull: {
                    'comments': id
                }
            })

            res.status(200).json({
                message: `You deleted comment with ID: ${id}`
            })
        }
    })
    .catch(err => {
        console.error(err);

        res.status(500).json(err);
    });
};

module.exports = {
    index,
    show,
    createCommentInVideo,
    createCommentInComment,
    update,
    destroy
}