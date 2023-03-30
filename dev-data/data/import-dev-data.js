/* eslint-disable */

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv= require('dotenv');
const Tour = require('./../../modals/tourModel');

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
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
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