const Video = require("../Models/video.model");
const Comment = require("../Models/comment.model");
const Channel = require("../Models/channel.model");
const deleteImage = require('../config/ImageDelete');

// Get all videos
const index = (req, res) => {
    // pagination and related queries
	const commentLimit = req.query.comment_limit | 10;
	const perPage = req.query.limit | 10;
	const page = req.query.page | 0;

    // find all videos in DB
	Video.find()
        // connect and populate relationships
		.populate([
			{
				path: "channel",
			},
			{
				path: "comments",
				limit: commentLimit,
			},
		])
        // limit amount of data shown 
        // by adding pagination
		.limit(perPage)
		.skip(perPage * page)
		.then(async (videos) => {
            // get length of video array and use it for pagination numbering
			let videosLength = Math.max(videos.length, 10);
            // if collection contains documents
            // returns 200 status
			if (videos.length > 0) {
				res.status(200).json({
					page: page,
					pages: Math.floor(videosLength / perPage),
					videos,
				});
			} else {
				res.status(404).json({
					message: "None Found",
				});
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json(err);
		});
};

// Show Video By Id
const show = (req, res) => {
	const id = req.params.id;

    // query
	const commentLimit = req.query.comment_limit | 10;

    // find video from id
	Video.findById(id)
        // connect and populate relationships
		.populate([
			{
				path: "channel",
			},
			{
				path: "comments",
                select: "-_video_id", // deselect _video_id
				limit: commentLimit, // limit amount of comments shown
			},
		])
		.then((video) => {
            // if video doesn't exist return 404
			if (!video)
				res.status(404).json({
					message: `Video ${id} not found!`,
				});

            // return video
			res.status(200).json(video);
		})
		.catch((err) => {
			if (err.name === "CastError") {
				console.error(err);
				res.status(404).json({
					message: `Video ${id} not found!`,
				});
			} else {
				console.error(err);
				res.status(500).json(err);
			}
		});
};

// Create Video
const create = async (req, res) => {
	let form = req.body;

    // remove immutable data from form
    const { _id, channel, views, comments, likes, dislikes, duration, createdAt, updatedAt } = form;

	if (req.file) {
        // assign thumbnail property to request file
		form.thumbnail = req.file.filename;
	}
	// if error occurs, delete stored image
	else {
        deleteImage(req.file.filename);

		res.status(422).json({
			message: "Image not uploaded!",
		});
	}

    // check if channel exists
	Channel.exists({ _id: req.channel._id })
		.then((channelId) => {
            // assign channel property to channel id
			form.channel = channelId;

            // create video doc
			Video.create(form)
				.then((newVideo) => {
					console.log(`New Video Created`, newVideo);
                    // push video id into channel doc
                    Channel.findByIdAndUpdate(channelId, {
                        $push: {
                            videos: newVideo._id
                        }
                    }).then(() => {
                        // successful, returns created video
                        res.status(201).json(newVideo);
                    }).catch(err => {
                        res.status(500).json(err);
                    })

				})
				.catch((err) => {
					if (err.name === "ValidationError") {
						deleteImage(req.file.filename)

						res.status(422).json({
							errors: err.errors,
						});
					} else {
						console.error(err);

						res.status(500).json(err);
					}
				});
		})
		.catch((err) => console.err(err));
};

const update = (req, res) => {
    // assign id, form from request params
	const id = req.params.id;
	const form = req.body;

    // remove immutable data from form
    const { _id, channel, views, comments, likes, dislikes, duration, createdAt, updatedAt } = form;

	//connect to model and retrieve video with specified id
	Video.findByIdAndUpdate(id, form, {
		new: true,
	})
    // return updated video
    .then((updatedData) => {
        res.status(201).json(updatedData);
    })
    // catch errors and display
    .catch((err) => {
        if (err.name === "ValidationError") {
            res.status(422).json({
                errors: err.errors,
            });
        } else if (err.name === "CastError") {
            console.error(err);

            res.status(404).json({
                message: `Video`,
            });
        }
    });
};

// Delete Video
const destroy = (req, res) => {
    // assign id from request parameter called 'id'
	let id = req.params.id;

	Video.findByIdAndDelete(id)
		.then((newVideo) => {
            // return if the video cannot be found
			if (!newVideo) {
				res.status(404).json({
					message: `Video ${id} not found!`,
				});
			} else {
                // find and remove video id from the channel doc
				Channel.findByIdAndUpdate(id, {
                    $pull: {
                        videos: newVideo._id
                    }
                })
                .then(async(channel) => {
                    // returns if channel cannot be found
                    if(!channel) {
                        return res.status(404).json({
                            message: 'Channel does not exist!'
                        });
                    }

                    // delete existing comments 
                    // or return 200 response
                    await Comment.deleteMany({ _video_id: id })
                    .then((comments) => {  
                        // if doesn't exist, just return with 200
                        if(!comments) {
                            res.status(200).json({
                                message: `You have successfully deleted the video with ID: ${id}`,
                            });
                        }

                        // if exists, response with suitable msg
                        res.status(200).json({
                            message: `You have successfully deleted the video with ID ${id} along with its comments`,
                        });
                    })
                    // console logging and response with errors
                    .catch(err => {
                        console.error(err);

                        res.status(500).json(err);
                    });


                })
                .catch(err => {
                    res.status(500).json(err)
                })
			}
		})
		.catch((err) => {
			console.error(err);

			res.status(500).json(err);
		});
};

module.exports = {
	index,
	show,
	create,
	update,
	destroy,
};
