const mongoose = require("mongoose");
const mongodb = require("mongodb");
const data = require("./data.json");
const Faker = require("@faker-js/faker");
const { faker } = Faker;
const bcrypt = require('bcryptjs');
const Video = require("./Models/video.model");
const Channel = require("./Models/channel.model");
const Comment = require("./Models/comment.model");

// create channels with random credentials & info
async function ChannelFactory(amount = 500) {
	for (i = 0; i < amount; i++) {
		// randomise first & last name
		const first_name = faker.person.firstName();
		const last_name = faker.person.lastName();

		// create channels to comment videos
		const channelData = {
			// create username, email based off of first & last name
			username: faker.internet.userName({
				firstName: first_name,
				lastName: last_name,
			}),
			email: faker.internet.email({
				firstName: first_name,
				lastName: last_name,
			}),
			// encrypt password
			password: bcrypt.hashSync('secret0123', 10),
			subscribers: faker.number.int({
				min: 0,
				max: 100000,
			}),
			createdAt: faker.date.past({ year: 10 }),
		};

		const channel = new Channel(channelData);
		// save new channel to DB
		await channel.save();
	}
}

// load data from local JSON data to create videos, comments & nested comments 
async function loadData(from = 0, to = data.length) {
	// keep track of how many videos has been iterated
	let videoIterate = from;

	if (to > data.length) to = data.length;

	while (videoIterate < to) {

		// random the amount of videos to populate the model
		// let amountOfVideos = to - from;
		let amountOfVideos = faker.number.int({
			min: 0,
			max: 500,
		});

		// create channels to populate videos
		const channelData = {
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			username: faker.internet.userName({
				firstName: this.first_name,
				lastName: this.last_name,
			}),
			email: faker.internet.email({
				firstName: this.first_name,
				lastName: this.last_name,
			}),
			password: faker.internet.password(),
			subscribers: faker.number.int({
				min: 0,
				max: 1000000,
			}),
			createdAt: faker.date.past({ year: 10 }),
		};

		// create channel instance
		const channel = new Channel(channelData);

		// check if (the randomised number plus all iterated videos) are greater than the length of data
		if (amountOfVideos + videoIterate > to) {
			amountOfVideos = to - videoIterate;
		}

		// iterate through amount videos
		for (let i = 0; i < amountOfVideos; i++) {

			// deconstruct obj & rename to convention name of the DB model
			const {
				Title: title,
				Videourl: url,
				Category: tag,
				Description: description,
			} = data[i];

			// assign obj props to new video
			const newVideo = {
				title,
				description,
				url,
				tag,
				likes: faker.number.int({
					min: 0,
					max: 10000,
				}),
				dislikes: faker.number.int({
					min: 0,
					max: 10000,
				}),
				channel: channel._id,
			};
			
			const video = new Video(newVideo);

			// random amount of comments
			const amountOfComments = faker.number.int({
				min: 0,
				max: 250,
			});

			// logging the amount of comments
			console.log(`amount of comment: ${amountOfComments}`);

			// pick from existing channels to comment on video
			const channels = await Channel.aggregate([
				{
					$sample: { size: amountOfComments },
				},
			]);

			console.log(`retrieved all channels to produce comments`);

			const comments = [];
			// iterate through all the channels to comment in video
			for (let j = 0; j < channels.length; j++) {
				const body = faker.lorem.lines();

				const comment = new Comment({
					_channel_id: channels[j]._id,
					body,
					likes: faker.number.int({
						min: 0,
						max: 10000,
					}),
					dislikes: faker.number.int({
						min: 0,
						max: 10000,
					}),
					_video_id: video._id,
				});

                comments.push(comment);

				// randomise child comments
				const amountOfNestedComments = faker.number.int({
					min: 0,
					max: 4,
				});

				// pick existing channels to comment on parent comment
				const nestedChannels = await Channel.aggregate([
					{
						$sample: { size: amountOfNestedComments },
					},
				]);

				let replies = [];
				// iterate child comments and push fake data into array
				for (let c = 0; c < nestedChannels.length; c++) {
					const nestedBody = faker.lorem.lines();

					const reply = new Comment({
						_channel_id: nestedChannels[c]._id,
						body: nestedBody,
						likes: faker.number.int({
							min: 0,
							max: 3000,
						}),
						dislikes: faker.number.int({
							min: 0,
							max: 3000,
						}),
						_video_id: video._id,
						_parent_comment_id: comment._id,
					});

					replies.push(reply);
					// await reply.save();
				}

				// push ids of child comments to video doc
				replies.forEach((reply) => video.comments.push(reply._id));

				// bulk save child comments to DB
				await Comment.bulkSave(replies);

				// push ids of parent comments to video 
				video.comments.push(comment._id);
			}

			// bulk save all comments both parent & child
			await Comment.bulkSave(comments);

			// save video to DB
			await video.save();

			// push video id into video array in channel
			channel.videos.push(video._id);

            await channel.save();
		}

		// keep count of videos iterated
		videoIterate += amountOfVideos;

	}

	// upon success, log to console
	console.log("successfully seeded the database");
}

module.exports = {
	loadData,
	ChannelFactory,
};
