require('dotenv').config();
const mongoose = require('mongoose');
const {faker} = require('@faker-js/faker');

// .env variables
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOSTNAME = process.env.DB_HOSTNAME;
const DB_COLLECTION = process.env.DB_COLLECTION;

// URL to connect to MongoDB
const URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOSTNAME}/${DB_COLLECTION}?retryWrites=true&w=majority`

// initialise connection
const init = () => {
    mongoose.set('debug', true);

    mongoose.connect(URL)
    // if error exits terminal
    .catch(err => {
        console.error(`Error: ${err.stack}`);

        process.exit(1);
    });

    // upon success - log to terminal
    mongoose.connection.on('open', () => {
        console.log('Connected to Database');
    });
};

module.exports = init;