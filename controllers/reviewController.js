const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');



exports.getAllReviews = catchAsync(async (req, res, next ) => {
    const reviews = await Review.find();

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