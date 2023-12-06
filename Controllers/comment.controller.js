const Comment = require("../Models/comment.model");
const Video = require("../Models/video.model");

// show all comments
/**
 * @openapi
 * /api/comments:
 *   get:
 *     tags:
 *      - comments
 *     summary: Retrieve a list of comments
 *     description: Retrieve a list of paginated comments. Default to 10 comments per page. Can iterate through page using 'page' & 'limit' query
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
 *     responses:
 *       200:
 *         description: Returns a list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  page:
 *                      type: integer
 *                      description: The current page number of comment list
 *                      example: 1
 *                  pages:
 *                      type: integer
 *                      description: The amount of pages
 *                      example: 136
 *                  comments:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              _id:
 *                                  type: string
 *                                  description: The comment objectID.
 *                                  example: 653d699d13d7c3d86a91c9ed
 *                              _channel_id:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type: string
 *                                          description: ObjectID of the channel that posted the comment.
 *                                          example: 653d699d13d7c3d86a91c9f1
 *                                      username:
 *                                          type: string
 *                                          description: channel's username.
 *                                          example: Diana01
 *                                      avatar:
 *                                          type: string
 *                                          description: channel's avatar url
 *                                          example: https://avatars.githubusercontent.com/u/16180050
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date
 *                                          description: the date the comment is created/updated
 *                                          example: 2023-05-18T07:07:14.036Z
 *                              _video_id:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type: string
 *                                          description: ObjectID of the parent if exists.
 *                                          example: 653d699d13d7c3d86a91c9f1
 *                                      title:
 *                                          type: string
 *                                          description: comment's title.
 *                                          example: This is a title
 *                                      url:
 *                                          type: string
 *                                          description: comment's url
 *                                          example: /watch?v=EwBA1fOQ96c
 *                              _parent_comment_id:
 *                                  type: object
 *                                  description: ObjectID of the parent comment
 *                                  example: 653d699d13d7c3d86a91c9f1
 *                              body:
 *                                  type: string
 *                                  description: The body of the comment.
 *                                  example: Lorem ipsum.
 *                              likes:
 *                                  type: integer
 *                                  description: number of likes in the comment.
 *                                  example: 100
 *                              dislikes:
 *                                  type: integer
 *                                  description: number of dislikes in the comment.
 *                                  example: 2
 *                              createdAt:
 *                                  type: string
 *                                  format: date
 *                                  description: the date the comment is created
 *                                  example: 2023-05-18T07:07:14.036Z
 *                              updatedAt:
 *                                  type: string
 *                                  format: date
 *                                  description: the date the comment is updated
 *                                  example: 2023-05-18T07:07:14.036Z
 *       404:
 *         description: No comments found.
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      msg:
 *                          type: string
 *                          description: returned message.
 *                          example: comments not found
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
	// API queries
	const page = req.query.page | 0;
	const perPage = req.query.limit | 10;

	// find comments and linking any relationships
	Comment.find()
		.populate([
			{
				path: "_channel_id",
				select: "-email -password -videos -__v -roles", //removing sensitive info
			},
			{
				path: "_video_id",
				select: ["_id", "title", "url"],
			},
		])
		.limit(perPage) //pagination
		.skip(page * perPage)
		.then(async (comments) => {
			// console.log(comments);

			// show comments if exist
			if (comments.length > 0) {
				let commentsLength = Math.max(
					await Comment.estimatedDocumentCount(),
					10
				);

				// return 200
				res.status(200).json({
					page: page + 1,
					pages: Math.floor(commentsLength / perPage),
					comments,
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

// showing comments by id
/**
 * @openapi
 * /api/comments/{id}:
 *   get:
 *     tags:
 *      - comments
 *     summary: Retrieve the comment with a specific ObjectID
 *     description: Retrieve the comment with a specific ObjectID.
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The video ObjectID
 *            default: 653c303970f555b2245cf569
 *     responses:
 *       200:
 *         description: Returns the comment with the same ObjectID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  _id:
 *                      type: string
 *                      description: The comment objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _channel_id:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                              description: ObjectID of the channel that posted the comment.
 *                              example: 653d699d13d7c3d86a91c9f1
 *                          username:
 *                              type: string
 *                              description: channel's username.
 *                              example: Diana01
 *                          avatar:
 *                              type: string
 *                              description: channel's avatar url
 *                              example: https://avatars.githubusercontent.com/u/16180050
 *                          updatedAt:
 *                              type: string
 *                              format: date
 *                              description: the date the comment is created/updated
 *                              example: 2023-05-18T07:07:14.036Z
 *                  _video_id:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                              description: ObjectID of the parent if exists.
 *                              example: 653d699d13d7c3d86a91c9f1
 *                          title:
 *                              type: string
 *                              description: comment's title.
 *                              example: This is a title
 *                          url:
 *                              type: string
 *                              description: comment's url
 *                              example: /watch?v=EwBA1fOQ96c
 *                  _parent_comment_id:
 *                      type: object
 *                      description: ObjectID of the parent comment
 *                      example: 653d699d13d7c3d86a91c9f1
 *                  body:
 *                      type: string
 *                      description: The body of the comment.
 *                      example: Lorem ipsum.
 *                  likes:
 *                      type: integer
 *                      description: number of likes in the comment.
 *                      example: 100
 *                  dislikes:
 *                      type: integer
 *                      description: number of dislikes in the comment.
 *                      example: 2
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is created
 *                      example: 2023-05-18T07:07:14.036Z
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is updated
 *                      example: 2023-05-18T07:07:14.036Z
 *       404:
 *         description: No comments found.
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      msg:
 *                          type: string
 *                          description: returned message.
 *                          example: comments not found
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

	// find comment and populate relationships
	Comment.findById(id)
		.populate([
			{
				path: "_channel_id",
				select: "_id username subscriber avatar",
			},
			{
				path: "_parent_comment_id",
			},
			{
				path: "_video_id",
				select: ["_id", "title", "url"],
			},
		])
		.then((comment) => {
			// if comment not found return 404
			if (!comment)
				res.status(404).json({
					message: `Comment ${id} not found!`,
				});

			res.status(200).json(comment);
		})
		.catch((err) => {
			if (err.name === "CastError") {
				console.error(err);
				res.status(404).json({
					message: `Comment ${id} not found!`,
				});
			} else {
				console.error(err);
				res.status(500).json(err);
			}
		});
};

// show child comments of a given comment id
/**
 * @openapi
 * /api/comments/{id}/children:
 *   get:
 *     tags:
 *      - comments
 *     summary: Retrieve the list of child comments from a comment with a specific ObjectID
 *     description: Retrieve the list of child comments from a comment with a specific ObjectID
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The comment ObjectID
 *            default: 653c303970f555b2245cf569
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
 *     responses:
 *       200:
 *         description: Returns the list of child comments from a comment with the same ObjectID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  page:
 *                      type: integer
 *                      description: The current page number of child comment list
 *                      example: 1
 *                  pages:
 *                      type: integer
 *                      description: The amount of pages
 *                      example: 136
 *                  comments:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              _id:
 *                                  type: string
 *                                  description: The comment objectID.
 *                                  example: 653d699d13d7c3d86a91c9ed
 *                              _channel_id:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type: string
 *                                          description: ObjectID of the channel that posted the comment.
 *                                          example: 653d699d13d7c3d86a91c9f1
 *                                      username:
 *                                          type: string
 *                                          description: channel's username.
 *                                          example: Diana01
 *                                      avatar:
 *                                          type: string
 *                                          description: channel's avatar url
 *                                          example: https://avatars.githubusercontent.com/u/16180050
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date
 *                                          description: the date the comment is created/updated
 *                                          example: 2023-05-18T07:07:14.036Z
 *                              _video_id:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type: string
 *                                          description: ObjectID of the parent if exists.
 *                                          example: 653d699d13d7c3d86a91c9f1
 *                                      title:
 *                                          type: string
 *                                          description: comment's title.
 *                                          example: This is a title
 *                                      url:
 *                                          type: string
 *                                          description: comment's url
 *                                          example: /watch?v=EwBA1fOQ96c
 *                              _parent_comment_id:
 *                                  type: object
 *                                  description: ObjectID of the parent comment
 *                                  example: 653d699d13d7c3d86a91c9f1
 *                              body:
 *                                  type: string
 *                                  description: The body of the comment.
 *                                  example: Lorem ipsum.
 *                              likes:
 *                                  type: integer
 *                                  description: number of likes in the comment.
 *                                  example: 100
 *                              dislikes:
 *                                  type: integer
 *                                  description: number of dislikes in the comment.
 *                                  example: 2
 *                              createdAt:
 *                                  type: string
 *                                  format: date
 *                                  description: the date the comment is created
 *                                  example: 2023-05-18T07:07:14.036Z
 *                              updatedAt:
 *                                  type: string
 *                                  format: date
 *                                  description: the date the comment is updated
 *                                  example: 2023-05-18T07:07:14.036Z
 *       404:
 *         description: No comments found.
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      msg:
 *                          type: string
 *                          description: returned message.
 *                          example: comments not found
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
const showChildComments = async (req, res) => {
	const id = req.params.id;
	const perPage = req.query.limit ? Math.max(10, req.query.limit) : 10;
	const page = req.query.page ? Math.max(1, req.query.page) : 1;

	if ((await Comment.countDocuments({ _parent_comment_id: id })) < 10) {
		Comment.find({ _parent_comment_id: id })
			.populate([
				{
					path: "_channel_id",
					select: "_id username subscriber avatar",
				},
			])
			.then(async (comments) => {
				if (!comments)
					res.status(404).json({
						message: `Parent comment ${id} not found!`,
					});

				// get the largest num. to use as a division for value of pages
				const commentsLength = Math.max(
					await Comment.countDocuments({ _parent_comment_id: id }),
					10
				);

				// if collection contains documents
				// returns 200 status
				res.status(200).json({
					page: page,
					pages: 1,
					comments,
				});
			})
			.catch((err) => {
				if (err.name === "CastError") {
					console.error(err);
					res.status(404).json({
						message: `Comment ${id} not found!`,
					});
				} else {
					console.error(err);
					res.status(500).json(err);
				}
			});
	} else {
		Comment.find({ _parent_comment_id: id })
			.populate([
				{
					path: "_channel_id",
					select: "_id username subscriber avatar",
				},
			])
			.limit(perPage)
			.skip(perPage * page)
			.then(async (comments) => {
				if (!comments)
					res.status(404).json({
						message: `Parent comment ${id} not found!`,
					});

				// get the largest num. to use as a division for value of pages
				const commentsLength = Math.max(
					await Comment.countDocuments({ _parent_comment_id: id }),
					10
				);

				// if collection contains documents
				// returns 200 status
				res.status(200).json({
					page: page,
					pages: Math.floor(commentsLength / perPage),
					comments,
				});
			})
			.catch((err) => {
				if (err.name === "CastError") {
					console.error(err);
					res.status(404).json({
						message: `Comment ${id} not found!`,
					});
				} else {
					console.error(err);
					res.status(500).json(err);
				}
			});
	}
};

// create comment in a video
/**
 * @openapi
 * /api/comments/video/{id}/create:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - comments
 *     summary: Create a comment in a video
 *     description: Create a comment in a video.
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The comment ObjectID
 *            default: 653c303970f555b2245cf569
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      body:
 *                          type: string
 *                          required: true
 *                          description: The body of the comment.
 *                          example: Lorem ipsum.
 *     responses:
 *       201:
 *         description: Returns the created comment data.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The comment objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _channel_id:
 *                      type: string
 *                      description: The ObjectID of the channel that made the comment
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _video_id:
 *                      type: string
 *                      description: The ObjectID of the video that the comment has been posted
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  body:
 *                      type: string
 *                      description: The body of the comment.
 *                      example: Lorem ipsum.
 *                  likes:
 *                      type: integer
 *                      description: number of likes in the comment.
 *                      example: 0
 *                  dislikes:
 *                      type: integer
 *                      description: number of dislikes in the comment.
 *                      example: 0
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is created
 *                      example: 2023-05-18T07:07:14.036Z
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is updated
 *                      example: 2023-05-18T07:07:14.036Z
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
const createCommentInVideo = async (req, res) => {
	let form = req.body;

	const videoId = req.params.videoId;
	// assign video id to form
	// get video id from parent comment id
	form._video_id = videoId;
	form._channel_id = req.channel._id;

	// create comment
	Comment.create(form)
		.then((data) => {
			// push comment id to video
			Video.findByIdAndUpdate(
				{ _id: videoId },
				{
					$push: {
						comments: data._id,
					},
				}
			);

			res.status(201).json(data);
		})
		.catch((err) => {
			if (err.name === "ValidationError") {
				res.status(422).json({
					errors: err.errors,
				});
			} else {
				console.error(err);

				res.status(500).json(err);
			}
		});
};

// create a comment in a parent comment
/**
 * @openapi
 * /api/comments/{id}/create:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - comments
 *     summary: Create a comment within another comment
 *     description: Create a comment within another comment.
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The comment ObjectID to comment within.
 *            default: 653c303970f555b2245cf569
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      body:
 *                          type: string
 *                          required: true
 *                          description: The body of the comment.
 *                          example: Lorem ipsum.
 *     responses:
 *       201:
 *         description: Returns the created comment data.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The comment objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _channel_id:
 *                      type: string
 *                      description: The ObjectID of the channel that made the comment
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _video_id:
 *                      type: string
 *                      description: The ObjectID of the video that the comment has been posted
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _parent_comment_id:
 *                      type: object
 *                      description: ObjectID of the parent comment if exists
 *                      example: 653d699d13d7c3d86a91c9f1
 *                  body:
 *                      type: string
 *                      description: The body of the comment.
 *                      example: Lorem ipsum.
 *                  likes:
 *                      type: integer
 *                      description: number of likes in the comment.
 *                      example: 0
 *                  dislikes:
 *                      type: integer
 *                      description: number of dislikes in the comment.
 *                      example: 0
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is created
 *                      example: 2023-05-18T07:07:14.036Z
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is updated
 *                      example: 2023-05-18T07:07:14.036Z
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
const createCommentInComment = async (req, res) => {
	let form = req.body;

	let commentId = req.params.commentId;

	// get video id from parent comment id
	form._video_id = (await Comment.findById(commentId))._video_id;
	form._channel_id = req.channel._id;
	form._parent_comment_id = commentId;

	// console.log(form._video_id);

	res.status(201).json(form);

	// create child comment
	Comment.create(form)
		.then(async (data) => {
			console.log(`New Comment Created`, data);
			// push child comment to video
			await Video.findByIdAndUpdate(
				{ _id: form._video_id },
				{
					$push: {
						comments: data._id,
					},
				}
			);

			res.status(201).json(data);
		})
		.catch((err) => {
			if (err.name === "ValidationError") {
				res.status(422).json({
					errors: err.errors,
				});
			} else {
				console.error(err);

				res.status(500).json(err);
			}
		});
};

// update comment function
/**
 * @openapi
 * /api/comments/{id}/update:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - comments
 *     summary: Update a comment
 *     description: Update a comment.
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The comment ObjectID to update.
 *            default: 653c303970f555b2245cf569
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      body:
 *                          type: string
 *                          required: true
 *                          description: The body of the comment.
 *                          example: Lorem ipsum.
 *     responses:
 *       201:
 *         description: Returns the created comment data.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The comment objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _channel_id:
 *                      type: string
 *                      description: The ObjectID of the channel that made the comment
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _video_id:
 *                      type: string
 *                      description: The ObjectID of the video that the comment has been posted
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  _parent_comment_id:
 *                      type: object
 *                      description: ObjectID of the parent comment if exists
 *                      example: 653d699d13d7c3d86a91c9f1
 *                  body:
 *                      type: string
 *                      description: The body of the comment.
 *                      example: Lorem ipsum.
 *                  likes:
 *                      type: integer
 *                      description: number of likes in the comment.
 *                      example: 0
 *                  dislikes:
 *                      type: integer
 *                      description: number of dislikes in the comment.
 *                      example: 0
 *                  createdAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is created
 *                      example: 2023-05-18T07:07:14.036Z
 *                  updatedAt:
 *                      type: string
 *                      format: date
 *                      description: the date the comment is updated
 *                      example: 2023-05-18T07:07:14.036Z
 *       404:
 *         description: comment not found
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The comment not found
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
	const id = req.params.id;
	const body = req.body;

	//connect to model and retrieve comment with specified id
	Comment.findByIdAndUpdate(id, body, {
		new: true,
	})
		.then((updatedData) => {
			res.status(201).json(updatedData);
		})
		.catch((err) => {
			if (err.name === "ValidationError") {
				res.status(422).json({
					errors: err.errors,
				});
			} else if (err.name === "CastError") {
				console.error(err);

				res.status(404).json({
					message: `Comment with ID ${id} Not Found`,
				});
			}
		});
};

// delete comment function
/**
 * @openapi
 * /api/comments/{id}/delete:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - comments
 *     summary: Delete a comment using ObjectID
 *     description: Delete a comment using ObjectID.
 *     parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        description: Comment ObjectID
 *        default: 653c303970f555b2245cf569
 *     responses:
 *       201:
 *         description: comment deleted
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The comment has been successfully deleted
 *       404:
 *         description: comment not found
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The comment found
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
	let id = req.params.id;
	// find comment and delete
	Comment.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					message: `Comment ${id} not found!`,
				});
			} else {
				// find video and delete comment id from comments array
				Video.findByIdAndUpdate(
					{ _id: data._video_id },
					{
						$pull: {
							comments: id,
						},
					}
				);

				res.status(200).json({
					message: `You deleted comment with ID: ${id}`,
				});
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
	showChildComments,
	createCommentInVideo,
	createCommentInComment,
	update,
	destroy,
};
