const catchAsync = require('./../utils/catchAsync');
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

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

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    // find the specific tour based on id in database
    // use popluate to replace guides id with actual user info, it is not shown in the database but will show after query with tour id
    const doc = await query;

    // if id format is correct but find null tour: 404 error
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    // Tour.findOne({_id: req.params.id}) based on mongo db

    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
// to allow for nested GET reviews on tour
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}
    // execute query
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
    // const doc = await features.query.explain(); show query result explanation
    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc,
        },
    });
});