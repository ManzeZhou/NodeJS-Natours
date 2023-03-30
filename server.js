/* eslint-disable */
// everything related to server in this file

const mongoose = require('mongoose');

const dotenv = require('dotenv');
//get environment variables
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



const app = require('./app');
const express = require("express");

// development environment of express
// console.log(app.get('env'));

// environment variables in nodejs
// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
