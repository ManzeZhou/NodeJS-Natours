// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// show tour and user info when request related to find reviews with only selected fields shown
reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path:'tour',
    //     select: 'name'
    // }).populate({
    //     path:'user',
    //     select: 'name photo'
    // });
    this.populate({
        path:'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        // select reviews
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats);
    // persist/update avg ratings in the database
    // if there is review
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });

    } else {
        // if there is no review, set a default value
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }

};

// each user can only make one comment to one tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.post('save', function () {
   // this points to current review

    this.constructor.calcAverageRatings(this.tour);
});

// delete or update reviews, update average ratings and its quantity
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
