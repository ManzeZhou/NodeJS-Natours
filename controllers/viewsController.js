const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");


exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template

    // 3) Render template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // get a tour and let booked user to leave a review

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'Reviews',
        fields: 'review rating user'
    });

    const booking = await Booking.findOne({user: res.locals.user, tour:tour});

    let commentExist;
    if(res.locals.user) {
        commentExist = tour.reviews.some(
            (review) => review.user.id === res.locals.id
        );

    }

    const booked = !!booking



    res.status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('tour', {
            title: `${tour.name} Tour`,
            tour,
            booked,
            commentExist
        })



    // // 1) get the data, for the requested tour (reviews and guides)
    // const tour = await Tour.findOne({slug: req.params.slug}).populate({
    //     path: 'Reviews',
    //     fields: 'review rating user'
    // });
    //
    //
    // // if there is no tour
    // if (!tour) {
    //     return next(new AppError('There is no tour with that name.', 404));
    // }
    //
    //
    //
    // // 2) Build template
    //
    // // 3) Render
    // res.status(200)
    //     .set(
    //         'Content-Security-Policy',
    //         "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    //     )
    //     .render('tour', {
    //         title: `${tour.name} Tour`,
    //         tour
    //     })
});

exports.getLoginForm = catchAsync(async (req, res) => {
    res.status(200)
        .set(
            'Content-Security-Policy',
            "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js 'unsafe-inline' 'unsafe-eval';"
        )
        .render('login', {
            title: 'Log into your account'
        });
});

exports.getSignupForm = (req, res) => {
    res.status(200)
        .render('signup', {
        title: 'create your account!'
    });
};

exports.getAccount = (req, res) => {
    res.status(200)
        .render('account', {
            title: 'Your account'
        });
};

// user's booing tours
exports.getMyTours = catchAsync(async (req, res, next)=> {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id});

    // 2) FinD tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    // if user has no bookings yet
    if(bookings.length === 0) {
        res.status(200).render('nullbooking', {
            title: 'Book Tours',
            headLine: `You haven't booked any tours yet!`,
            msg: `Please book a tour and come back. 🙂`
        });
    } else {
        res.status(200).render('overview', {
            title: 'My Tours',
            tours
        });
    }



});

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log('UPDATING USER',req.body);
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    // render account page again to get update data
    res.status(200)
        .render('account', {
            title: 'Your account',
            user: updateUser
        });
});