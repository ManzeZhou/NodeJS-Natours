const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('../models/bookingModel');
const AppError = require("../utils/appError");


exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next ) => {
//     // if there is a tourId in the req, find the target tour reviews
//     let filter = {}
//     if(req.params.tourId) filter = {tour: req.params.tourId}
//
//     const reviews = await Review.find(filter);
//
//     res.status(200).json({
//         status:'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });

exports.setTourUserIds = (req, res, next) => {
    // if there is no tour id / user id in the req.body, get tourId and userId from req
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};
exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//     // if there is no tour id / user id in the req.body, get tourId and userId from req
//     if(!req.body.tour) req.body.tour = req.params.tourId;
//     if(!req.body.user) req.body.user = req.user.id;
//
//     const newReview = await Review.create(req.body);
//
//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     });
// });

// only let user who booked the tour can leave a review
exports.checkBooking = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({
        user: req.user.id,
        tour: req.body.tour
    });
    if(bookings.length === 0) {
        return next(new AppError('You can only review the tours you booked', 401));
    }

    next()
});

exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReivew = factory.getOne(Review);