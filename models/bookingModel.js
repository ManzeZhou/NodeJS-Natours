const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a Tour!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paid: {
        // if customer doesn't have a credit card, admin manually paid
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    // only guides and admin can check bookings
    this.populate('user').pupulate({
        path: 'tour',
        select: 'name'
    })
})

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking;