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
    name: {
        type: String,
        required: true

    },
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    userImage: {
        type: String,
        default: ''
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
}, {
    timestamps: true
});

module.exports.reviewModel = model('Review', reviewSchema);