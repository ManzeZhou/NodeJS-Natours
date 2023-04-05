/* eslint-disable */
//create a schema for tour
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  // first object: schema definition
  {
    name: {
      type: String,
      // validator
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // hide this data for user
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      // usually the tour is not secret
      default: false,
    },
  },
  // second object:schema options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties: convert duration into weeks not in the database but as soon as get data
// use function(){} because arrow function does not have this keyword
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// mongo db middleware: 1 DOCUMENT middleware
// pre middleware run before an event: run before save() and create()
tourSchema.pre('save', function (next) {
  // this point to current document
  // create slug by using slugify package
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
//
// // post middleware
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// mongo db middleware: 2 QUERY middleware
// pre middleware before any find query
// tourSchema.pre('find', function (next) {
// Method 2: all the command starts with find
tourSchema.pre(/^find/, function (next) {
  // select tours that are not secrete
  this.find({ secretTour: { $ne: true } });

  // this.start = Date.now();
  next();
});
// but for find one with secrete id, it still shows
// Method 1:
// tourSchema.pre('findOne', function (next) {
//   // select tours that are not secrete
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// run after any find command
tourSchema.post(/^find/, function (docs, next) {
  // create a clock to measure how long it will take to execute query
  // console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// 3 AGGREGATION middleware: exclude secret tour in the aggregation:
// 127.0.0.1:3000/api/v1/tours/tour-stats & 127.0.0.1:3000/api/v1/tours/monthly-plan/2021
tourSchema.pre('aggregate', function (next) {
  // console.log('aggregation --->', this.pipeline());
  // add another match stage for secrete tour at the first pipeline array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
