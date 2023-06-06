const express = require('express');

const reviewController = require('./../controllers/reviewController');

const authController = require('./../controllers/authController');


const router = express.Router();

// use auth protect to only allow protected users to create reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview);

module.exports = router;


