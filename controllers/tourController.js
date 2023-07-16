// const fs = require("fs");

// define tour model in the database
const Tour = require('../models/tourModel');

// const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');

const multer = require("multer");
const sharp = require("sharp");


// store file in the memory
const multerStorage = multer.memoryStorage();

// test if upload file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    // if not pass an error
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// store location of upload file
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// upload tour images
exports.uploadTourImages= upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// process upload tour images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
      req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
  })
  );


  next();
});


// use alias to prefill the req.query
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// read tours data file at the beginning: block event loop
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// check ID when update/post a new tour
// exports.checkID = (req, res, next, val) => {
//   // val is value of param
//   console.log(`Tour id is: ${val}`);
//
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "failed",
//       message: "Invalid ID"
//     });
//   }
//   next();
// };

// check body: check if req has a name and price
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "failed",
//       message: "missing name or price"
//     });
//   }
//   next();
// };

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // execute query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   const tours = await features.query;
//
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // try {
//   //   //127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy; Express use req.query save param object
//   //   // console.log(req.query);
//   //   // build query
//   //   // 1 Filtering
//   //   // const queryObj = { ...req.query };
//   //   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   //   // // filter out excludedFields
//   //   // excludedFields.forEach(el => delete queryObj[el]);
//   //   // console.log(req.query, queryObj);
//   //
//   //   // 2 Advanced Filtering
//   //   // 127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy find all tours that duration >= 5
//   //   // req.query = { duration: { gte: '5' }, difficulty: 'easy' }
//   //   // mongo db { duration: { $gte: '5' }, difficulty: 'easy' }
//   //   // replace special string into mongo db command: gte/greater=, gt/greater than, lte/less=, lt/less than
//   //   // let queryStr = JSON.stringify(queryObj);
//   //   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//   //   //
//   //   //
//   //   // // get Tours data from MongoDB database also filter data
//   //   // // Mongoose Method 1
//   //   // let query =  Tour.find(JSON.parse(queryStr));
//   //
//   //   // 3 Sorting
//   //   // if there is a sorting field in request\
//   //   // price: low to high -price: high to low
//   //   // if(req.query.sort) {
//   //   //   // sort ('price ratingsAverage')
//   //   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   //   query = query.sort(sortBy);
//   //   // } else {
//   //   //   // if user doesn't input req.param, set a default one
//   //   //   // query=query.sort('-createdAt');
//   //   //   query=query.sort('-createdAt _id');
//   //   // }
//   //
//   //   // 4 Field
//   //   // limiting: filter the data to only get some fields
//   //   //127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
//   //   // if(req.query.fields) {
//   //   //   const fields = req.query.fields.split(',').join(' ');
//   //   //   query = query.select(fields);
//   //   // } else {
//   //   //   // set default: remove some fields: - to excluding
//   //   //   query= query.select('-__v');
//   //   // }
//   //
//   //   // 5 Pagination
//   //   // set default page and limit, transfer string into num
//   //   // const page = req.query.page * 1 || 1;
//   //   // const limit = req.query.limit * 1 || 100;
//   //   // const skip = (page - 1) * limit;
//   //   //
//   //   // // page=3&limit=10 skip how many tours with each page limit
//   //   // query = query.skip(skip).limit(limit);
//   //   //
//   //   // // if skip number is greater than data number
//   //   // if (req.query.page) {
//   //   //   const numTours = await Tour.countDocuments();
//   //   //   if (skip >= numTours) throw new Error('This page does not exist');
//   //   // }
//   //
//   //   // execute query
//   //   const features = new APIFeatures(Tour.find(), req.query)
//   //     .filter()
//   //     .sort()
//   //     .limitFields()
//   //     .pagination();
//   //   const tours = await features.query;
//   //   // const tours = await query;
//   //
//   //   // const tours = await Tour.find({
//   //   //   duration: 5,
//   //   //   difficulty: 'easy'
//   //   // });
//   //
//   //   // Mongoose Method 2
//   //   // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
//   //
//   //   // console.log(req.requestTime);
//   //   res.status(200).json({
//   //     status: 'success',
//   //     // requestedAt: req.requestTime
//   //     results: tours.length,
//   //     data: {
//   //       tours,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// define a variable id for tours
// question mark ? for params mean do not need to have it, its optional
exports.getTour = factory.getOne(Tour,{ path: 'Reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // find the specific tour based on id in database
//   // use popluate to replace guides id with actual user info, it is not shown in the database but will show after query with tour id
//   const tour = await Tour.findById(req.params.id).populate('Reviews');
//
//   // if id format is correct but find null tour: 404 error
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   // Tour.findOne({_id: req.params.id}) based on mongo db
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // try {
//   //   // find the specific tour based on id in database
//   //   const tour = await Tour.findById(req.params.id);
//   //
//   //   // Tour.findOne({_id: req.params.id}) based on mongo db
//   //
//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
//   // send back all the tours
//   // console.log("req.params", req.params);
//
//   // id comes from tours' id, find the id from request
//   // trans string into number
//   // const id = req.params.id * 1;
//   // if tour id does not exist
//   // Solution 1:
//   // if(id > tours.length) {
//   //     return res.status(404).json({
//   //         status: 'failed',
//   //         message: 'Invalid ID'
//   //     })
//   // }
//   // const tour = tours.find(el => el.id === id);
//
//   // Solution 2: if didn't find match tour
//   // if(!tour) {
//   //     return res.status(404).json({
//   //         status: 'failed',
//   //         message: 'Invalid ID'
//   //     })
//   // }
//
//   // res.status(200).json({
//   //   status: "success",
//   //   data: {
//   //     tour
//   //   }
//   //   // result: tours.length,
//   //   // data: {
//   //   //     tours
//   //   //     //tours: tours
//   //   // }
//   // });
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // try {
//   //   // create tour to the cloud database
//   //   // method 1:
//   //   // const newTour = new Tour({})
//   //   // newTour.save()
//   //   //create a schema for tour
//   //
//   //   // testing create tour in mongodb database
//   //
//   //   // const testTour = new Tour({
//   //   //   name: 'The Park Camper',
//   //   //    rating: 4.7,
//   //   //   price: 997,
//   //   // });
//   //   //  save tour to the database
//   //   // testTour.save().then(doc => {
//   //   //   console.log(doc);
//   //   // }).catch(err => {
//   //   //   console.log('ERROR ----> :',err)
//   //   // });
//   //
//   //   // method 2: use create()
//   //   const newTour = await Tour.create(req.body);
//   //
//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
//   // use postman to post a request with body like this: {
//   //     "name": "Test Tour",
//   //     "duration": 10,
//   //     "difficulty": "easy"
//   // }
//   // console.log(req.body);
//
//   // const newId = tours[tours.length - 1].id + 1;
//   // // Object.assign combine two objects together
//   // const newTour = Object.assign({ id: newId }, req.body);
//   // tours.push(newTour);
//
//   // add new tour into the file and show it on the page
//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   err => {
//   //     res.status(201).json({
//   //       status: "success",
//   //       data: {
//   //         tour: newTour
//   //       }
//   //     });
//   //   });
// });

// patch request to update data
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   // update a tour in database based on id
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     // check validators such as required, maxlength
//     runValidators: true,
//   });
//
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//
//   console.log('tour ----->', tour);
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//
//   // try {
//   //   // update a tour in database based on id
//   //   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//   //     new: true,
//   //     // check validators such as required, maxlength
//   //     runValidators: true,
//   //   });
//   //
//   //   console.log('tour ----->', tour);
//   //
//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// delete request
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
//   // try {
//   //   await Tour.findByIdAndDelete(req.params.id);
//   //
//   //   res.status(204).json({
//   //     status: 'success',
//   //     data: null,
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// calculate tours statistic by using mongodb pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  // aggregation pipeline
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // group documents together
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        //calculate average rating
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // 1 for ascending
      $sort: { avgPrice: 1 },
    },
    // {
    //   // ne: not include
    //   $match: { _id: { $ne: 'EASY'}}
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // try {
  //   // aggregation pipeline
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } },
  //     },
  //     {
  //       // group documents together
  //       $group: {
  //         // _id: '$ratingsAverage',
  //         _id: { $toUpper: '$difficulty' },
  //         //calculate average rating
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' },
  //       },
  //     },
  //     {
  //       // 1 for ascending
  //       $sort: { avgPrice: 1 },
  //     },
  //     // {
  //     //   // ne: not include
  //     //   $match: { _id: { $ne: 'EASY'}}
  //     // }
  //   ]);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // pipeline unwind: group documents based on an array index: create new tour with one date
    {
      $unwind: '$startDates',
    },
    {
      // find tours startDates in a specific time period: 2021
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // only show month : aggregation operator
        _id: { $month: '$startDates' },
        // how many tours start in that month
        numTourStarts: { $sum: 1 },
        // create an array for tours name
        tours: { $push: '$name' },
      },
    },
    {
      // crete a field
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        // hide id field: 0 for hide, 1 for show
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      // limit showing documents
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // try {
  //   const year = req.params.year * 1;
  //   const plan = await Tour.aggregate([
  //     // pipeline unwind: group documents based on an array index: create new tour with one date
  //     {
  //       $unwind: '$startDates',
  //     },
  //     {
  //       // find tours startDates in a specific time period: 2021
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`),
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         // only show month : aggregation operator
  //         _id: { $month: '$startDates' },
  //         // how many tours start in that month
  //         numTourStarts: { $sum: 1 },
  //         // create an array for tours name
  //         tours: { $push: '$name' },
  //       },
  //     },
  //     {
  //       // crete a field
  //       $addFields: { month: '$_id' },
  //     },
  //     {
  //       $project: {
  //         // hide id field: 0 for hide, 1 for show
  //         _id: 0,
  //       },
  //     },
  //     {
  //       $sort: { numTourStarts: -1 },
  //     },
  //     {
  //       // limit showing documents
  //       $limit: 12,
  //     },
  //   ]);
  //
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       plan,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});


// /tours-within/:distance/center/:lat,lng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // radius of the earth in miles = 3963.2,radius of the earth in km = 6378.1
  // mongoDB expect radius to be in radians unit
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng){
    next(
        new AppError(
            'Please provide latitude and longitude in the format lat,lng.', 400
        )
    );
  }
  // console.log(distance, lat, lng, unit);

  // query tours
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// show tours in distance
exports.getDistances = catchAsync(async (req, res, next ) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if(!lat || !lng){
    next(
        new AppError(
            'Please provide latitude and longitude in the format lat,lng.', 400
        )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        // distances in meters, need to convert to km
        distanceMultiplier: multiplier
      }
    },
      // get rid of the other data, only show distance and tour name
    {
      $project: {
        distance: 1,
        name: 1
      }
    }

  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });

});
