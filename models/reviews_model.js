const {
    Schema,
    model
} = require('mongoose');

const reviewSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },

    user: {
        type: String,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    images: {
        type: [String],
        default: []
    },
});

module.exports.reviewModel = model('Review', reviewSchema);