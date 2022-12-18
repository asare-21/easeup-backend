const {
    Schema,
    model
} = require('mongoose');

const reviewSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
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

module.exports = model('Review', reviewSchema);