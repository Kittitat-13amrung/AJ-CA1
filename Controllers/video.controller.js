const Video = require("../Models/video.model");
const Comment = require("../Models/comment.model");
const Channel = require("../Models/channel.model");
const fs = require('fs');

const index = (req, res) => {
	const commentLimit = req.query.comment_limit | 10;
	const perPage = req.query.limit | 10;
	const page = req.query.page | 0;

	Video.find()
		.populate([
			{
				path: "channel",
			},
			{
				path: "comments",
				limit: commentLimit,
			},
		])
		.limit(perPage)
		.skip(perPage * page)
		.then(async (data) => {
			console.log(data);

			let countVideo = await Video.countDocuments({});

			console.log(countVideo);

			if (data.length > 0) {
				res.status(200).json({
					page: page,
					pages: Math.floor(countVideo / perPage),
					data,
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

const show = (req, res) => {
	const id = req.params.id;

	const commentLimit = req.query.comment_limit | 10;

	Video.findById(id)
		.populate([
			{
				path: "channel",
			},
			{
				path: "comments",
				limit: commentLimit,
			},
		])
		.then((video) => {
			if (!video)
				res.status(404).json({
					message: `Video ${id} not found!`,
				});

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

const create = async (req, res) => {
	let form = req.body;

	// form.channel = ;

	if (req.file) {
		form.thumbnail = req.file.filename;
	}
	// include the following else if image is required
	else {
		fs.unlink(`./public/uploads/${req.file.filename}`, (err) => {
			if (err) {
				return console.error(err);
			}

			return "Successfully deleted the image";
		});

		res.status(422).json({
			message: "Image not uploaded!",
		});
	}

	Channel.findOne({ email: req.channel.email })
		.then((channel) => {
			form.channel = channel._id;

			Video.create(form)
				.then((data) => {
					console.log(`New Video Created`, data);

					res.status(201).json(data);
				})
				.catch((err) => {
					if (err.name === "ValidationError") {
						fs.unlink(`./public/uploads/${req.file.filename}`, (err) => {
							if (err) {
								return console.error(err);
							}

							return "Successfully deleted the image";
						});

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
	const id = req.params.id;
	const data = req.body;

	//connect to model and retrieve video with specified id
	Video.findByIdAndUpdate(id, data, {
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
					message: `Video`,
				});
			}
		});
};

const destroy = (req, res) => {
	let id = req.params.id;

	Video.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					message: `Video ${id} not found!`,
				});
			} else {
				res.status(200).json({
					message: `You deleted festival with ID: ${id}`,
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
	create,
	update,
	destroy,
};
