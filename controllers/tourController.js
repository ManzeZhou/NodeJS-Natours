/* eslint-disable */
// const fs = require("fs");

// define tour model in the database
const Tour = require("./../modals/tourModel");
const e = require("express");


// read tours data file at the beginning: block event loop
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// check ID when update/post a new tour
// exports.checkID = (req, res, next, val) => {
//   // val is value of param
//   console.log(`Tour id is: ${val}`);
//
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "failed",
//       message: "Invalid ID"
//     });
//   }
//   next();
// };

// check body: check if req has a name and price
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "failed",
//       message: "missing name or price"
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {

  try {
    // get Tours data from MongoDB database
    const tours = await Tour.find();

    // console.log(req.requestTime);
    res.status(200).json({
      status: "success",
      // requestedAt: req.requestTime
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};

// define a variable id for tours
// question mark ? for params mean do not need to have it, its optional
exports.getTour = async (req, res) => {
  try {
    // find the specific tour based on id in database
    const tour = await Tour.findById(req.params.id);

    // Tour.findOne({_id: req.params.id}) based on mongo db

    res.status(200).json({
      status: "success",
      data: {
        tour
      }
    });

  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
  // send back all the tours
  // console.log("req.params", req.params);

  // id comes from tours' id, find the id from request
  // trans string into number
  // const id = req.params.id * 1;
  // if tour id does not exist
  // Solution 1:
  // if(id > tours.length) {
  //     return res.status(404).json({
  //         status: 'failed',
  //         message: 'Invalid ID'
  //     })
  // }
  // const tour = tours.find(el => el.id === id);

  // Solution 2: if didn't find match tour
  // if(!tour) {
  //     return res.status(404).json({
  //         status: 'failed',
  //         message: 'Invalid ID'
  //     })
  // }

  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     tour
  //   }
  //   // result: tours.length,
  //   // data: {
  //   //     tours
  //   //     //tours: tours
  //   // }
  // });
};

exports.createTour = async (req, res) => {

  try {
    // create tour to the cloud database
    // method 1:
    // const newTour = new Tour({})
    // newTour.save()
    //create a schema for tour

    // testing create tour in mongodb database

    // const testTour = new Tour({
    //   name: 'The Park Camper',
    //    rating: 4.7,
    //   price: 997,
    // });
    //  save tour to the database
    // testTour.save().then(doc => {
    //   console.log(doc);
    // }).catch(err => {
    //   console.log('ERROR ----> :',err)
    // });

    // method 2: use create()
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    });
  }
  // use postman to post a request with body like this: {
  //     "name": "Test Tour",
  //     "duration": 10,
  //     "difficulty": "easy"
  // }
  // console.log(req.body);

  // const newId = tours[tours.length - 1].id + 1;
  // // Object.assign combine two objects together
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);

  // add new tour into the file and show it on the page
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(201).json({
  //       status: "success",
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   });
};

// patch request to update data
exports.updateTour = async (req, res) => {

  try {
    // update a tour in database based on id
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('tour ----->',tour);

    res.status(200).json({
      status: "success",
      data: {
        tour
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};

// delete request
exports.deleteTour = async (req, res) => {

  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};