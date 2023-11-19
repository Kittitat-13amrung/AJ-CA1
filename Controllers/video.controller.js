const Video = require("../Models/video.model");
const Comment = require("../Models/comment.model");
const Channel = require("../Models/channel.model");
const deleteImage = require('../config/ImageDelete');

	/**
	 * @openapi
     * 
     * components:
     *  securitySchemes:
     *      bearerAuth:
     *          type: http
     *          scheme: bearer
     *          bearerFormat: JWT
     *                                          
	 */

// Get all videos
/**
	 * @openapi
	 * /api/videos:
	 *   get:
     *     tags:
     *      - videos
	 *     summary: Retrieve a list of videos
	 *     description: Retrieve a list of paginated videos. Default to 10 videos per page. Can iterate through page using 'page' & 'limit' query
     *     parameters:
     *          - in: query
     *            name: page
     *            type: integer
     *            description: The page to select
     *            default: 1
     *          - in: query
     *            name: limit
     *            type: integer
     *            description: The numbers of items to skip before showing the result
     *            default: 10
     *          - in: query
     *            name: comment_limit
     *            type: integer
     *            description: The numbers of comment to show
     *            default: 10
	 *     responses:
	 *       200:
	 *         description: Returns a list of videos.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
     *                  page:
     *                      type: integer
     *                      description: The current page number of video list
     *                      example: 1
     *                  pages:
     *                      type: integer
     *                      description: The amount of pages
     *                      example: 136
     *                  videos:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              _id:
     *                                  type: string
     *                                  description: The video objectID.
     *                                  example: 653d699d13d7c3d86a91c9ed
     *                              title:
     *                                  type: string
     *                                  description: The video's title.
     *                                  example: This is a title of the video.
     *                              url:
     *                                  type: string
     *                                  description: The video's url.
     *                                  example: /watch?v=xt4SsI6xcss
     *                              tag:
     *                                  type: string
     *                                  description: The video's tag.
     *                                  example: Food
     *                              description: 
     *                                  type: string
     *                                  description: The description of the video.
     *                                  example: Lorem ipsum.
     *                              likes:
     *                                  type: integer
     *                                  description: number of likes in the video.
     *                                  example: 100
     *                              dislikes:
     *                                  type: integer
     *                                  description: number of dislikes in the video.
     *                                  example: 2
     *                              thumbnail:
     *                                  type: string
     *                                  description: video's thumbnail url.
     *                                  example: https://picsum.photos/640/320/?random&t=1670360628221
     *                              comments:
     *                                  type: array
     *                                  items:
     *                                      type: object
     *                                      properties:
     *                                          _id:
     *                                              type: string
     *                                              description: Comment ObjectId.
     *                                              example: 653d699d13d7c3d86a91c9f1
     *                                          _channel_id:
     *                                              type: string
     *                                              description: ObjectID of the channel that posted the comment.
     *                                              example: 653d699d13d7c3d86a91c9f1
     *                                          _video_id:
     *                                              type: string
     *                                              description: ObjectID of the video that comment is posted on.
     *                                              example: 653d699d13d7c3d86a91c9f1
     *                                          body:
     *                                              type: string
     *                                              description: comment's body.
     *                                              example: Lorem Ipsum
     *                                          likes:
     *                                              type: integer
     *                                              description: number of likes in the comment.
     *                                              example: 25
     *                                          dislikes:
     *                                              type: integer
     *                                              description: number of dislikes in the comment.
     *                                              example: 8
     *                                          _parent_comment_id:
     *                                              type: string
     *                                              nullable: 'true'
     *                                              description: ObjectId of the parent comment if the comment has one.
     *                                              example: 653d699d13d7c3d86a91c9f1
     *                                          createdAt:
     *                                              type: string
     *                                              format: date
     *                                              description: the date of which the video is created.
     *                                              example: 2023-10-28T20:06:08.226Z
     *                              channel:
     *                                  type: object
     *                                  properties:
     *                                      _id:
     *                                          type: string
     *                                          description: ObjectID of the channel that posted the video.
     *                                          example: 653d699d13d7c3d86a91c9f1
     *                                      username: 
     *                                          type: string
     *                                          description: channel's username.
     *                                          example: Diana01
     *                                      avatar:
     *                                          type: string
     *                                          description: channel's avatar url
     *                                          example: https://avatars.githubusercontent.com/u/16180050
     *                              updatedAt: 
     *                                  type: string
     *                                  format: date
     *                                  description: the date the video is created/updated
     *                                  example: 2023-05-18T07:07:14.036Z
     *                              duration:
     *                                  type: integer
     *                                  description: the duration of the video
     *                                  example: 100
     *                              views:
     *                                  type: integer
     *                                  description: the views of the video
     *                                  example: 100000
	 *       404:
	 *         description: No videos found.
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      msg:
     *                          type: string
     *                          description: returned message.
     *                          example: video not found
     * 
	 *       500:
	 *         description: Internal error
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      errors:
     *                          type: array
     *                          items:
     *                              example: errors
     *                                          
	 */
const index = (req, res) => {
    // pagination and related queries
	const commentLimit =  req.query.comment_limit ? Math.max(10, req.query.comment_limit) : 10;
	const perPage = req.query.limit ? Math.max(10, req.query.limit) : 10;
	const page = req.query.page ? Math.max(0, req.query.page) : 0;

    // find all videos in DB
	Video.find()
        // connect and populate relationships
		.populate([
			{
				path: "channel",
				select: '_id username subscriber avatar'
			},
			{
				path: "comments",
				select: '-createdAt',
				limit: commentLimit,
			},
		]).select('-__v -createdAt')
        // limit amount of data shown 
        // by adding pagination
		.limit(perPage)
		.skip(perPage * page)
		.then(async (videos) => {
            // get length of video array and use it for pagination numbering
			let videosLength = Math.max(await Video.estimatedDocumentCount(), 10);
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
/**
	 * @openapi
	 * /api/videos/{id}:
	 *   get:
     *     tags:
     *      - videos
	 *     summary: Retrieve the video with a specific ObjectID
	 *     description: Retrieve the video with a specific ObjectID.
     *     parameters:
     *          - in: path
     *            name: id
     *            type: string
     *            description: The video ObjectID
     *            default: 653c303970f555b2245cf569
     *          - in: query
     *            name: comment_limit
     *            type: integer
     *            description: The numbers of comments to show
     *            default: 10
	 *     responses:
	 *       200:
	 *         description: Returns the video with the same ObjectID.
	 *         content:
	 *           application/json:
	 *             schema:
     *              type: object
     *              properties:
     *                  _id:
     *                      type: string
     *                      description: The video objectID.
     *                      example: 653d699d13d7c3d86a91c9ed
     *                  title:
     *                      type: string
     *                      description: The video's title.
     *                      example: This is a title of the video.
     *                  url:
     *                      type: string
     *                      description: The video's url.
     *                      example: /watch?v=xt4SsI6xcss
     *                  tag:
     *                      type: string
     *                      description: The video's tag.
     *                      example: Food
     *                  description: 
     *                      type: string
     *                      description: The description of the video.
     *                      example: Lorem ipsum.
     *                  likes:
     *                      type: integer
     *                      description: number of likes in the video.
     *                      example: 100
     *                  dislikes:
     *                      type: integer
     *                      description: number of dislikes in the video.
     *                      example: 2
     *                  thumbnail:
     *                      type: string
     *                      description: video's thumbnail url.
     *                      example: https://picsum.photos/640/320/?random&t=1670360628221
     *                  comments:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              _id:
     *                                  type: string
     *                                  description: Comment ObjectId.
     *                                  example: 653d699d13d7c3d86a91c9f1
     *                              _channel_id:
     *                                  type: string
     *                                  description: ObjectID of the channel that posted the comment.
     *                                  example: 653d699d13d7c3d86a91c9f1
     *                              _video_id:
     *                                  type: string
     *                                  description: ObjectID of the video that comment is posted on.
     *                                  example: 653d699d13d7c3d86a91c9f1
     *                              body:
     *                                  type: string
     *                                  description: comment's body.
     *                                  example: Lorem Ipsum
     *                              likes:
     *                                  type: integer
     *                                  description: number of likes in the comment.
     *                                  example: 25
     *                              dislikes:
     *                                  type: integer
     *                                  description: number of dislikes in the comment.
     *                                  example: 8
     *                              _parent_comment_id:
     *                                  type: string
     *                                  nullable: 'true'
     *                                  description: ObjectId of the parent comment if the comment has one.
     *                                  example: 653d699d13d7c3d86a91c9f1
     *                              createdAt:
     *                                  type: string
     *                                  format: date
     *                                  description: the date of which the video is created.
     *                                  example: 2023-10-28T20:06:08.226Z
     *                  channel:
     *                      type: object
     *                      properties:
     *                          _id:
     *                              type: string
     *                              description: ObjectID of the channel that posted the video.
     *                              example: 653d699d13d7c3d86a91c9f1
     *                          username: 
     *                              type: string
     *                              description: channel's username.
     *                              example: Diana01
     *                          avatar:
     *                              type: string
     *                              description: channel's avatar url
     *                              example: https://avatars.githubusercontent.com/u/16180050
     *                  updatedAt: 
     *                      type: string
     *                      format: date
     *                      description: the date the video is created/updated
     *                      example: 2023-05-18T07:07:14.036Z
     *                  duration:
     *                      type: integer
     *                      description: the duration of the video
     *                      example: 100
     *                  views:
     *                      type: integer
     *                      description: the views of the video
     *                      example: 100000
	 *       404:
	 *         description: No videos found.
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      msg:
     *                          type: string
     *                          description: returned message.
     *                          example: video not found
     * 
	 *       500:
	 *         description: Internal error
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      errors:
     *                          type: array
     *                          items:
     *                              example: errors
     *                                          
	 */
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
				select: '_id username subscriber avatar'
			},
			{
				path: "comments",
                select: "-_video_id -createdAt", // deselect _video_id
				limit: commentLimit, // limit amount of comments shown
			},
		]).select('-__v -createdAt')
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
    /**
	 * @openapi
	 * /api/videos/create:
	 *   post:
     *     security:
     *      - bearerAuth: []
     *     tags:
     *      - videos
	 *     summary: Create a video
	 *     description: Create a video.
     *     requestBody:
     *      content:
     *          multipart/form-data:
     *              schema:
     *                  type: object
     *                  properties:
     *                      title:
     *                          type: string
     *                          required: true
     *                          description: the title of the video
     *                          example: This is the title of the video.
     *                      duration:
     *                          type: integer
     *                          required: true
     *                          description: the duration of the video
     *                          example: 100
     *                      url:
     *                          type: string
     *                          required: true
     *                          description: the url of the video
     *                          example: /watch?v=8Px7yR06Ym4
     *                      tag:
     *                          type: string
     *                          required: true
     *                          description: the tag of the video
     *                          example: Food
     *                      description:
     *                          type: string
     *                          description: the description ofthe video
     *                          exmaple: Lorem ipsum
     *                      thumbnail:
     *                          type: string
     *                          format: binary
	 *     responses:
	 *       201:
	 *         description: Returns the created video data.
	 *         content:
	 *           application/json:
	 *             schema:
     *              type: object
     *              properties:
     *                  _id:
     *                      type: string
     *                      description: The video objectID.
     *                      example: 653d699d13d7c3d86a91c9ed
     *                  title:
     *                      type: string
     *                      description: The video's title.
     *                      example: This is a title of the video.
     *                  url:
     *                      type: string
     *                      description: The video's url.
     *                      example: /watch?v=xt4SsI6xcss
     *                  tag:
     *                      type: string
     *                      description: The video's tag.
     *                      example: Food
     *                  description: 
     *                      type: string
     *                      description: The description of the video.
     *                      example: Lorem ipsum.
     *                  likes:
     *                      type: integer
     *                      description: number of likes in the video.
     *                      default: 0
     *                  dislikes:
     *                      type: integer
     *                      description: number of dislikes in the video.
     *                      default: 0
     *                  thumbnail:
     *                      type: string
     *                      description: video's thumbnail url.
     *                      example: https://picsum.photos/640/320/?random&t=1670360628221
     *                  comments:
     *                      type: array
     *                  channel:
     *                      type: string
     *                      description: the channel that created the video
     *                      example: 6547c4b51da6734c80b98b6a
     *                  createdAt: 
     *                      type: string
     *                      format: date
     *                      description: the date the video is created
     *                      example: 2023-05-18T07:07:14.036Z
     *                  updatedAt: 
     *                      type: string
     *                      format: date
     *                      description: the date the video is updated
     *                      example: 2023-05-18T07:07:14.036Z
     *                  duration:
     *                      type: integer
     *                      description: the duration of the video
     *                      example: 100
     *                  views:
     *                      type: integer
     *                      description: the views of the video
     *                      default: 0
     * 
	 *       500:
	 *         description: Internal error
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      errors:
     *                          type: array
     *                          items:
     *                              example: errors
     *                                          
	 */
const create = async (req, res) => {
	let form = req.body;

    // remove immutable data from form
    const { _id, channel, views, comments, likes, dislikes, duration, createdAt, updatedAt } = form;

	if (req.file) {
        // assign thumbnail property to request file
		form.thumbnail = req.file.location;
	}
	// if error occurs, delete stored image
	else {
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

// update video
    /**
	 * @openapi
	 * /api/videos/{id}/update:
	 *   put:
     *     security: 
     *      - bearerAuth: []
     *     tags:
     *      - videos
	 *     summary: Update a video using ObjectID
	 *     description: Update a video using ObjectID.
     *     parameters:
     *      - in: path
     *        name: id
     *        type: string
     *        description: Video ObjectID
     *        default: 653c303970f555b2245cf569
     *     requestBody:
     *      content:
     *          multipart/form-data:
     *              schema:
     *                  type: object
     *                  properties:
     *                      title:
     *                          type: string
     *                          required: true
     *                          description: the title of the video
     *                          example: This is the title of the video.
     *                      tag:
     *                          type: string
     *                          required: true
     *                          description: the tag of the video
     *                          example: Food
     *                      description:
     *                          type: string
     *                          description: the description ofthe video
     *                          exmaple: Lorem ipsum
     *                      thumbnail:
     *                          type: string
     *                          format: binary
	 *     responses:
	 *       201:
	 *         description: Returns the updated video data.
	 *         content:
	 *           application/json:
	 *             schema:
     *              type: object
     *              properties:
     *                  _id:
     *                      type: string
     *                      description: The video objectID.
     *                      example: 653d699d13d7c3d86a91c9ed
     *                  title:
     *                      type: string
     *                      description: The video's title.
     *                      example: This is a title of the video.
     *                  url:
     *                      type: string
     *                      description: The video's url.
     *                      example: /watch?v=xt4SsI6xcss
     *                  tag:
     *                      type: string
     *                      description: The video's tag.
     *                      example: Food
     *                  description: 
     *                      type: string
     *                      description: The description of the video.
     *                      example: Lorem ipsum.
     *                  likes:
     *                      type: integer
     *                      description: number of likes in the video.
     *                      default: 0
     *                  dislikes:
     *                      type: integer
     *                      description: number of dislikes in the video.
     *                      default: 0
     *                  thumbnail:
     *                      type: string
     *                      description: video's thumbnail url.
     *                      example: https://picsum.photos/640/320/?random&t=1670360628221
     *                  comments:
     *                      type: array
     *                  channel:
     *                      type: string
     *                      description: the channel that created the video
     *                      example: 6547c4b51da6734c80b98b6a
     *                  createdAt: 
     *                      type: string
     *                      format: date
     *                      description: the date the video is created
     *                      example: 2023-05-18T07:07:14.036Z
     *                  updatedAt: 
     *                      type: string
     *                      format: date
     *                      description: the date the video is updated
     *                      example: 2023-05-18T07:07:14.036Z
     *                  duration:
     *                      type: integer
     *                      description: the duration of the video
     *                      example: 100
     *                  views:
     *                      type: integer
     *                      description: the views of the video
     *                      default: 0
     * 
	 *       500:
	 *         description: Internal error
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      errors:
     *                          type: array
     *                          items:
     *                              example: errors
     *                                          
	 */
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
    /**
	 * @openapi
	 * /api/videos/{id}/delete:
	 *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags:
     *      - videos
	 *     summary: Delete a video using ObjectID
	 *     description: Delete a video using ObjectID.
     *     parameters:
     *      - in: path
     *        name: id
     *        type: string
     *        description: Video ObjectID
     *        default: 653c303970f555b2245cf569
	 *     responses:
	 *       201:
	 *         description: video deleted
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      message:
     *                          type: array
     *                          items:
     *                              example: The video has been successfully deleted
	 *       404:
	 *         description: video not found
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      message:
     *                          type: array
     *                          items:
     *                              example: The video found                               
	 *       500:
	 *         description: Internal error
	 *         content:
	 *           application/json:
     *              schema:
     *                  properties:
     *                      errors:
     *                          type: array
     *                          items:
     *                              example: errors
     *                                          
	 */   
const destroy = (req, res) => {
    // assign id from request parameter called 'id'
	let id = req.params.id;
	let channel_id = req.channel._id;

	Video.findByIdAndDelete(id)
		.then((newVideo) => {
            // return if the video cannot be found
			if (!newVideo) {
				res.status(404).json({
					message: `Video ${id} not found!`,
				});
			} else {
                // find and remove video id from the channel doc
				Channel.findByIdAndUpdate(channel_id, {
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
                        // if doesn't exist, just return with 404
                        if(!comments) {
                            res.status(200).json({
                                message: `Comment with this ID doesn't exists`,
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
