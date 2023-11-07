const mongoose = require("mongoose");
const { Schema, Connection } = mongoose;
require('dotenv').config();
const {loadData, ChannelFactory} = require('./seeding');
const Video = require('./Models/video.model')
const Channel = require('./Models/channel.model')
const Comment = require('./Models/comment.model')
const username = encodeURIComponent('n00201327');
const password = encodeURIComponent(process.env.DB_PASSWORD);
const host = encodeURIComponent('cluster0.yxq2uw7.mongodb.net');
const database = encodeURIComponent('articles_db');
const Faker = require('@faker-js/faker');
const {faker} = Faker;

// const url = `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`
const url = `mongodb+srv://n00201327:secret0123@cluster0.yxq2uw7.mongodb.net/CA1?retryWrites=true&w=majority`

const connect = async () => {
    await mongoose.connect(url);

    console.log('database successfully connected');

    // console.log('seeding channels');
    // await ChannelFactory();
    console.log('seeding the database');
    // await loadData(227);

    const videos = await Video.find();

    for(const video of videos) {
        const updateVid = await Video.findOneAndUpdate({ _id: video._id }, {
            createdAt: faker.date.past({ year: 10 }),
        }, {
            strict: false,
            new: true,
            timestamps: false,
        })
        
        console.log(updateVid.createdAt)
    }

    // console.log(result)

    // console.log(videos)

    // const channelData = {
    //     // _id: mongoose.Schema.ObjectId,
    //     first_name: faker.person.firstName(),
    //     last_name: faker.person.lastName(),
    //     username: faker.internet.userName({
    //         firstName: this.first_name,
    //         lastName: this.last_name,
    //     }),
    //     email: faker.internet.email({
    //         firstName: this.first_name,
    //         lastName: this.last_name,
    //     }),
    //     password: faker.internet.password(),
    //     subscribers: faker.number.int({
    //         min: 0,
    //         max: 1000000
    //     }),
    //     createdAt: faker.date.past({ year: 10 }),
    // }

    // const channel = new Channel(channelData)

    // const videos = await Video.findOne({
    //     channel: "653c1aad12b0ec5ac1d68d0b"
    // }).populate({
    //     path: 'comments',
    //     _parent_comment_id: { $exist: false },
    //     limit: 2
    // }).exec();

    // const channel = await Channel.findOne({
    //     _id: "653c1aad12b0ec5ac1d68d0b"
    // }).exec();

    // videos.forEach(video => channel.videos.push(video._id));
    // console.log(videos);
    // await channel.save();
    // console.log(await channel.populate([{
    //     path: 'videos',
    //     limit: 2,
    // }, {
    //     path: 'videos.comments',
    //     limit: 2
    // }]));

    // const amountOfNestedComments = faker.number.int({
    //     min: 0,
    //     max: 10,
    // });
    process.exit()
    
    // const nestedChannels = await Channel.aggregate(
    //     [
    //         {
    //             $sample: { size: amountOfNestedComments }
    //         }
    //     ]
    // )
    
    // console.log(amountOfNestedComments, nestedChannels);

    // const videos = mongoose.model('Video', videoSchema);
    // seeding();

    // videos.findOne();
}

connect();