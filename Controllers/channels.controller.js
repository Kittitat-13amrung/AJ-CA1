const Channel = require("../Models/channel.model");
const Video = require("../Models/video.model");
const { destroy: deleteVideo } = require("../Controllers/video.controller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Comment = require("../Models/comment.model");
require("dotenv").config();
const deleteImage = require("../config/ImageDelete");

// register new channel
/**
 * @openapi
 * /api/channels/register:
 *   post:
 *     tags:
 *      - channels
 *     summary: Register channel
 *     description: Register channel.
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                          required: true
 *                          description: the email will be use for registration
 *                          example: sam.scott@gmail.com
 *                      username:
 *                          type: string
 *                          required: true
 *                          description: the username wil be use for registration
 *                          example: sscott123
 *                      password:
 *                          type: string
 *                          required: true
 *                          description: the password will be used for login
 *                          example: secret0123
 *                          format: password
 *                      avatar:
 *                          type: string
 *                          format: binary
 *     responses:
 *       201:
 *         description: Returns the created channel data.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The channel objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  username:
 *                      type: string
 *                      description: channel's username.
 *                      example: Diana01
 *                  email:
 *                      type: string
 *                      description: channel's email address.
 *                      example: Diana01@gmail.com
 *                  avatar:
 *                      type: string
 *                      description: channel's avatar url
 *                      example: https://avatars.githubusercontent.com/u/16180050
 *                  subscriber:
 *                      type: integer
 *                      description: channel's subscriber amount
 *                      example: 0
 *                  videos:
 *                      type: array
 *                      description: list of video ObjectID
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
 *       400:
 *         description: Bad Request
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
const register = (req, res) => {
	// create a channel instance from request body
	const newChannel = new Channel(req.body);

	// encrypt password
	newChannel.password = bcrypt.hashSync(req.body.password, 10);

	// validate request body
	let err = newChannel.validateSync();

	if (req.file) {
		// assign thumbnail property to request file
		newChannel.avatar = req.file.location;
	}
	// if error occurs, delete stored image
	else {
		res.status(422).json({
			message: "Image not uploaded!",
		});
	}

	// return error if exists
	if (err) {
		console.error(err);
		return res.status(500).json(err);
	}

	// save channel
	newChannel
		.save()
		.then((channel) => {
			channel.password = undefined;
			return res.status(201).json(channel);
		})
		.catch((err) => {
			return res.status(400).json({
				msg: err,
			});
		});
};

// login function
/**
 * @openapi
 * /api/channels/login:
 *   post:
 *     tags:
 *      - channels
 *     summary: Log in to channel
 *     description: Log in to channel. This returns a token to access authenticated routes
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                          required: true
 *                          description: the email will be used for login
 *                          example: sam.scott@gmail.com
 *                      password:
 *                          type: string
 *                          required: true
 *                          description: the password will be used for login
 *                          format: password
 *                          example: secret0123
 *     responses:
 *       200:
 *         description: Returns the channel with the matching credential with its access token.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The channel objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  username:
 *                      type: string
 *                      description: channel's username.
 *                      example: Diana01
 *                  avatar:
 *                      type: string
 *                      description: channel's avatar url
 *                      example: https://avatars.githubusercontent.com/u/16180050
 *                  token:
 *                      type: string
 *                      description: channel's access token
 *                      example: token
 *
 *       401:
 *         description: authentication failed
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: Authentication failed. Invalid channel or password
 *
 *       404:
 *         description: video not found
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The channel not found
 *
 */
const login = (req, res) => {
	// store login credential
	const credential = req.body;

	console.log(req);

	// find channel by email
	Channel.findOne({ email: credential.email })
		.then((channel) => {
			// if channel doesn't exist or password is incorrect
			// return auth failed
			if (
				!channel ||
				!credential.password ||
				!channel.comparePassword(credential.password)
			) {
				return res.status(401).json({
					msg: "Authentication failed. Invalid channel or password",
				});
			}

			// upon success, return token
			let token = jwt.sign(
				{
					email: channel.email,
					username: channel.username,
					_id: channel._id,
				},
				process.env.JWT_SECRET
			);

			return res.status(200).json({
				_id: channel._id,
				username: channel.username,
				avatar: channel.avatar,
				token,
			});
		})
		.catch((err) => {
			console.error(err);
			return res.status(404).json(err);
		});
};

// login middleware
const loginRequired = (req, res, next) => {
	// console.log(req.channel)
	if (req.channel) return next();

	return res.status(401).json({ msg: "Unauthorised channel!" });
};

// show channel by id
/**
 * @openapi
 * /api/channels/{id}:
 *   get:
 *     tags:
 *      - channels
 *     summary: Retrieve the channel with a specific ObjectID
 *     description: Retrieve the channel with a specific ObjectID.
 *     parameters:
 *          - in: path
 *            name: id
 *            type: string
 *            description: The channel ObjectID
 *            default: 653c303970f555b2245cf569
 *     responses:
 *       200:
 *         description: Returns the channel with the same ObjectID.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The channel objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  username:
 *                      type: string
 *                      description: channel's username.
 *                      example: Diana01
 *                  email:
 *                      type: string
 *                      description: channel's email address.
 *                      example: Diana01@gmail.com
 *                  avatar:
 *                      type: string
 *                      description: channel's avatar url
 *                      example: https://avatars.githubusercontent.com/u/16180050
 *                  subscriber:
 *                      type: integer
 *                      description: channel's subscriber amount
 *                      example: 0
 *                  videos:
 *                      type: array
 *                      description: list of video ObjectID
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
 *         description: No channels found.
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      msg:
 *                          type: string
 *                          description: returned message.
 *                          example: channel not found
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
	// find channel by id and show all videos
	Channel.findOne({ _id: req.params.id })
		.populate([
			{
				path: "videos",
				select: "_id title url tag thumbnail duration createdAt views",
			},
		])
		.select("-password -__v -email -createdAt")
		.then((channel) => {
			if (!channel) {
				return res.status(404).json({
					message: "Channel does not exist!",
				});
			}

			channel.password = undefined;

			return res.status(200).json(channel);
		});
};

// update channel
/**
 * @openapi
 * /api/channels/update:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - channels
 *     summary: Update a channel using ObjectID
 *     description: Update a channel using ObjectID.
 *     requestBody:
 *      content:
 *          multipart/form-data:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *                          description: the username of the channel
 *                          example: This is the username of the channel.
 *                      password:
 *                          type: string
 *                          description: the password of the channel
 *                          format: password
 *                          examle: secret0123
 *                      avatar:
 *                          type: string
 *                          description: profile picture of the channel
 *                          format: binary
 *     responses:
 *       201:
 *         description: Returns the updated channel data.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: The channel objectID.
 *                      example: 653d699d13d7c3d86a91c9ed
 *                  username:
 *                      type: string
 *                      description: channel's username.
 *                      example: Diana01
 *                  email:
 *                      type: string
 *                      description: channel's email address.
 *                      example: Diana01@gmail.com
 *                  avatar:
 *                      type: string
 *                      description: channel's avatar url
 *                      example: https://avatars.githubusercontent.com/u/16180050
 *                  subscriber:
 *                      type: integer
 *                      description: channel's subscriber amount
 *                      example: 0
 *                  videos:
 *                      type: array
 *                      description: list of video ObjectID
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
const update = (req, res) => {
	let form = req.body;
	const id = req.channel._id;

	// check for imgs
	if (req.file) {
		form.avatar = req.file.filename;

		Channel.findById(id).then((channel) => {
			// delete profile image saved on AWS Bucket
			if (channel.avatar) {
				const url = channel.avatar.split("/");
				const isBaseURL = url[2].includes(
					"advanced-js.s3.eu-west-1.amazonaws.com"
				);

				if (isBaseURL) {
					deleteImage(url[3]);

					console.log("deleted");
				}
			}
		});
	}

	// check if channel exists
	Channel.exists({ _id: id })
		.then((channelId) => {
			// if exists, find by id and update
			Channel.findByIdAndUpdate(channelId, form)
				.then((updatedData) => {
					console.log(`Channel has been updated`, updatedData);

					res.status(201).json(updatedData);
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
		})
		.catch((err) => {
			console.error(err);
		});
};

// delete channel
/**
 * @openapi
 * /api/channels/delete:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - channels
 *     summary: Delete a channel using ObjectID
 *     description: Delete a channel using ObjectID.
 *     responses:
 *       201:
 *         description: channel deleted
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The channel has been successfully deleted
 *       404:
 *         description: channel not found
 *         content:
 *           application/json:
 *              schema:
 *                  properties:
 *                      message:
 *                          type: array
 *                          items:
 *                              example: The channel found
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
const destroy = async (req, res) => {
	// assign id from request parameter called 'id'
	let id = req.channel._id;

	const channel = await Channel.findById({ _id: id });

	Channel.findByIdAndDelete(id)
		.then((deletedChannel) => {
			// return if the channel cannot be found
			if (!deletedChannel) {
				res.status(404).json({
					message: `Channel ${id} not found!`,
				});
			} else {
				// find and remove video id from the channel
				Video.exists({ channel: id }).then(async (videos) => {
					// delete videos made by the channel
					// along with the comments inside
					if (await Video.exists({ channel: id })) {
						await Comment.deleteMany({
							_video_id: {
								$in: channel.videos,
							},
						});

						await Video.deleteMany({ channel: id });
					}

					// delete existing comments made by the channel
					if (await Comment.exists({ _channel_id: id })) {
						await Comment.deleteMany({ _channel_id: id });
					}

					// delete profile image
					if (channel.avatar) {
						const url = channel.avatar.split("/");
						const isBaseURL = url[2].includes(
							"advanced-js.s3.eu-west-1.amazonaws.com"
						);

						if (isBaseURL) {
							deleteImage(url[3]);

							console.log("deleted");
						}
					}

					res.status(200).json(deletedChannel);
				});
			}
		})
		.catch((err) => {
			console.error(err);

			res.status(500).json(err);
		});
};

module.exports = {
	register,
	login,
	loginRequired,
	show,
	update,
	destroy,
};
