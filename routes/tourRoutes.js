// create a new router as a middleware
const express = require('express');

const tourController = require('./../controllers/tourController');
// or destructured {getAllTours, createTour...} = require('./../controllers/tourController')

// const reviewController = require('./../controllers/reviewController');

const reviewRouter = require('./../routes/reviewRoutes');

const authController = require('./../controllers/authController');

const router = express.Router();

// when req route is /:tourId/reviews, use reviewRouter
router.use('/:tourId/reviews', reviewRouter);
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     )



// get tour id
// router.param('id', tourController.checkID);

// five best rating and cheaper tours:127.0.0.1:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price: use alias middleware
// 127.0.0.1:3000/api/v1/tours/top-5-cheap
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// calculate tours statistic: average ratings/price
router.route('/tour-stats').get(tourController.getTourStats);
// calculate tours amount for a given year/month
router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

//Geospatial Queries: find tours within Radius
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45,unit=mi
// /tours-within/233/center/-40,45/unit/mi

// show tours in distance
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// use app.route to refactor url
// for get all tours and create a tour

// app.route('/api/v1/tours') use express.Router to manage route
// protect getAllTours only show tour lists when user sign in
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.createTour
  );
// .post(tourController.checkBody,tourController.createTour);

// route for update a tour, get a tour and delete a tour

// app.route('/api/v1/tours/:id')
// only allow admin user login and delete tours
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.resizeTourImages,
      tourController.updateTour)
  .delete(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.deleteTour
  );



module.exports = router;
