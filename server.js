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
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log('connections',con.connections);
    console.log('DB connection successful!');
  });

const app = require('./app');
const express = require('express');

// development environment of express
// console.log(app.get('env'));

// environment variables in nodejs
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// handle error connection to db if db password is wrong
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection! shutting down...');
  // shut down server
  server.close(() => {
    // shut down app
    process.exit(1);
  });
});

// uncaught exception
process.on('uncaughtException', (err) => {
  console.log('uncaughtException! shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
//  uncaught exception example: try to log an undefined variable
// console.log(x);
