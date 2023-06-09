const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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
    // 1) get the data, for the requested tour (reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'Reviews',
        fields: 'review rating user'
    });

    // if there is no tour
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template

    // 3) Render
    res.status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        //     .set(
        //         'Content-Security-Policy',
        //         "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
        //     )
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
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