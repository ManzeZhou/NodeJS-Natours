const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');


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
        fields:'review rating user'
    });
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