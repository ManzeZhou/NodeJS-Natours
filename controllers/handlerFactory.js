const catchAsync = require('./../utils/catchAsync');
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");

exports.deleteOne = Model => catchAsync(async (req, res, next) =>{
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
    }
)

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }
//
//     res.status(204).json({
//         status: 'success',
//         data: null,
//     });
// });

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    // update a tour in database based on id
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        // check validators such as required, maxlength
        runValidators: true,
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }


    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});