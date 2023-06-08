const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');



exports.getAllReviews = catchAsync(async (req, res, next ) => {
    // if there is a tourId in the req, find the target tour reviews
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}

    const reviews = await Review.find(filter);

    res.status(200).json({
        status:'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    // if there is no tour id / user id in the req.body, get tourId and userId from req
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

exports.deleteReview = factory.deleteOne(Review)