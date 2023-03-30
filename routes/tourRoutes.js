/* eslint-disable */
// create a new router as a middleware
const express = require("express");

const tourController = require("./../controllers/tourController");
// or destructured {getAllTours, createTour...} = require('./../controllers/tourController')

const router = express.Router();

// get tour id
// router.param('id', tourController.checkID);


// use app.route to refactor url
// for get all tours and create a tour

// app.route('/api/v1/tours') use express.Router to manage route
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// .post(tourController.checkBody,tourController.createTour);

// route for update a tour, get a tour and delete a tour

// app.route('/api/v1/tours/:id')
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);


module.exports = router;