require('dotenv').config();
const mongoose = require('mongoose');
const {faker} = require('@faker-js/faker');


const init = () => {
    mongoose.set('debug', true);

    mongoose.connect(process.env.DB_ATLAS_URL, {
        useNewUrlParser: true
    })
    .catch(err => {
        console.error(`Error: ${err.stack}`);

        process.exit(1);
    });

    mongoose.connection.on('open', () => {
        console.log('Connected to Database');

        console.log(faker.date.past({ years: 10 }));
    });
};

module.exports = init;