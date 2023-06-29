//create a schema for tour
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
    // first object: schema definition
    {
        name: {
            type: String,
            // validator
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal than 40 characters'],
            minlength: [10, 'A tour name must have less or equal than 10 characters'],
            // use validator package to validate if input only have string without spaces
            // validate: [
            //   validator.isAlpha,
            //   'A tour name must only contain alphabet letters',
            // ],
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
            // enum only allowed specific strings
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            // round ratingsAverage
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            // build a validator to check if price discount lower than price itself
            // only for create but not for update
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'Discount price should be below the regular price',
            },
        },
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
        startLocation: {
            // GeoJSON for geo data
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        // guides: Array
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ],
        reviews: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Review'
            }
        ],

    },
    // second object:schema options
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

// sort tour in an ascending price order
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// virtual properties: convert duration into weeks not in the database but as soon as get data
// use function(){} because arrow function does not have this keyword
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('Reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// mongo db middleware: 1 DOCUMENT middleware
// pre middleware run before an event: run before save() and create()
tourSchema.pre('save', function (next) {
    // this point to current document
    // create slug by using slugify package
    this.slug = slugify(this.name, {lower: true});
    next();
});


// embedded guides by using id inside tours
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises)
//     next();
// });

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
    this.find({secretTour: {$ne: true}});

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

// each find method run this middleware first to show guides info and hide passowordChangeAt and __v
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        // hide __v and passwordChangeAt
        select: '-__v -passwordChangeAt'
    });
    next();
})


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
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
