const express = require('express');

const reviewController = require('./../controllers/reviewController');

const authController = require('./../controllers/authController');

// user mergeParams to let reviewRoutes access to tourId in tourRoutes
const router = express.Router({ mergeParams: true });

// use auth protect to only allow protected users to create reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReivew)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = router;


