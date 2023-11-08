const Comment = require('../Models/comment.model');
const Video = require('../Models/video.model');

const index = (req, res) => {
    const page =  req.query.page | 0;
    const perPage = req.query.limit | 10;

    Comment.find().populate([
        {
            path: '_channel_id',
            select: '-email -password -videos -__v -roles'
        },
        {
            path: '_parent_comment_id',
        },
        {
            path: '_video_id',
            select: ['_id', 'title', 'url']
        },
    ])
    .limit(perPage)
    .skip(page * perPage)
    .then(async(comments) => {
        console.log(comments);

        if(comments.length > 0) {
            const commentsLength = Math.max(10, comments.length)

            res.status(200).json({
                page: page + 1,
                pages: Math.floor(commentsLength / perPage),
                comments
            });
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

const showChildComments = (req, res) => {
    const id = req.params.id;
    const page = 0;
    const perPage = 10;

    Comment.find({ _parent_comment_id: id }).populate([
        {
            path: '_channel_id',
            select: '-roles -email -password -__v'
        },
    ])
    .limit(perPage)
    .skip(perPage * page)
    .then((comments) => {
        if(!comments) res.status(404).json({
            message: `Parent comment ${id} not found!`
        });

        // get the largest num. to use as a division for value of pages
        const commentsLength = Math.max(10, comments.length);

        console.log(commentsLength)

        res.status(200).json({
            pagination: {
                page: page + 1,
                pages: Math.floor(commentsLength / perPage)
            },
            comments
        });
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

    const videoId = req.params.videoId

    form._video_id = videoId;

    Comment.create(form)
    .then(data => {
        console.log(`New Comment Created`, data);

        Video.findByIdAndUpdate({ _id: videoId }, {
            $push: {
                'comments': data._id
            }
        });

        res.status(201).json(data);
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            res.status(422).json({
                errors: err.errors
            });
        } else {
            console.error(err);

            res.status(500).json(err);
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
    const body = req.body.body;

    // destructuring object to exclude properties from form
    // const { _id, channel_id, _video_id, likes, dislikes, _parent_comment_id, } = form;

     //connect to model and retrieve comment with specified id
     Comment.findByIdAndUpdate(id, body, {
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
    showChildComments,
    createCommentInVideo,
    createCommentInComment,
    update,
    destroy
}