const mongoose = require("mongoose");
const mongodb = require("mongodb");
const data = require("./data.json");
const Faker = require("@faker-js/faker");
const { faker } = Faker;
const Video = require("./Models/video.model");
const Channel = require("./Models/channel.model");
const Comment = require("./Models/comment.model");

async function ChannelFactory(epoch = 500) {
	for (i = 0; i < epoch; i++) {
		const first_name = faker.person.firstName();
		const last_name = faker.person.lastName();

		// create channels to comment videos
		const channelData = {
			username: faker.internet.userName({
				firstName: first_name,
				lastName: last_name,
			}),
			email: faker.internet.email({
				firstName: first_name,
				lastName: last_name,
			}),
			password: faker.internet.password(),
			subscribers: faker.number.int({
				min: 0,
				max: 100000,
			}),
			createdAt: faker.date.past({ year: 10 }),
		};

		const channel = new Channel(channelData);

		await channel.save();
	}
}

// async function dropDB() {
//     mongoose.dr
// }

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
			// _id: mongoose.Schema.ObjectId,
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

		const channel = new Channel(channelData);

		// await channel.save();

		// check if (the randomised number plus all iterated videos) are greater than the length of data
		if (amountOfVideos + videoIterate > to) {
			amountOfVideos = to - videoIterate;
		}

		for (let i = 0; i < amountOfVideos; i++) {

			const {
				Title: title,
				Videourl: url,
				Category: tag,
				Description: description,
			} = data[i];

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

			const amountOfComments = faker.number.int({
				min: 0,
				max: 250,
			});

			console.log(`amount of comment: ${amountOfComments}`);

			const channels = await Channel.aggregate([
				{
					$sample: { size: amountOfComments },
				},
			]);

			console.log(`retrieved all channels to produce comments`);

			const comments = [];

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

				// await comment.save();

				const amountOfNestedComments = faker.number.int({
					min: 0,
					max: 4,
				});

				const nestedChannels = await Channel.aggregate([
					{
						$sample: { size: amountOfNestedComments },
					},
				]);

				let replies = [];

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

				replies.forEach((reply) => video.comments.push(reply._id));

				await Comment.bulkSave(replies);

				video.comments.push(comment._id);
			}

			await Comment.bulkSave(comments);

			await video.save();

			channel.videos.push(video._id);

            await channel.save();
		}

		videoIterate += amountOfVideos;

		// console.log(videos)

		// add randomised number to amount of iterated videos
	}

	console.log("successfully seeded the database");
}

// loadData();

module.exports = {
	loadData,
	ChannelFactory,
};
