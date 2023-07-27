const {
    Schema,
    model
} = require('mongoose');


const userBookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    is_paid: {
        type: Boolean,
        default: false
    },
    agreed_price: {
        type: Number,
        required: true
    },
    is_completed: {
        type: Boolean,
        default: false
    },
    is_cancelled: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

module.exports.userBooking = model('UserBooking', userBookingSchema);