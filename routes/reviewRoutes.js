const express = require('express');

const reviewController = require('./../controllers/reviewController');

const authController = require('./../controllers/authController');

// user mergeParams to let reviewRoutes access to tourId in tourRoutes
const router = express.Router({ mergeParams: true });

// set auth
router.use(authController.protect);

// use auth protect to only allow protected users to create reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.checkBooking,
        reviewController.setTourUserIds,
        reviewController.createReview
    );

// only user and admin can modify and delete reviews
router
    .route('/:id')
    .get(reviewController.getReivew)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = router;


