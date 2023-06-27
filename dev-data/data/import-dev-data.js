/* eslint-disable */

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv= require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connect to mongodb database
mongoose
  .connect(DB, {
    // userNewUrlParse: true,
    useCreateIndex: true,
    // useFindModify: false,
    useNewUrlParser: true
  })
  .then((con) => {
    // console.log('connections',con.connections);
    console.log('DB connection successful!')
  });

// read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// import data into db
const importData = async () => {
  try {

    await Tour.create(tours);
    // since users json file do not have passwordConfirm, turn off validation
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

// delete all data from collection
const deleteData = async () => {
  try {
    // delete all documents
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
    // after call the function, quit the process
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

if(process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// to write data into db: node dev-data/data/import-dev-data.js --import

// to write delete data: node dev-data/data/import-dev-data.js --delete
console.log(process.argv);