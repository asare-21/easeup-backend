const {
    Schema,
    model
} = require('mongoose');
const { reviewSchema } = require('./reviews_model');

const comment = new Schema({
    from: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const media = new Schema({
    url: {
        type: [String],
        required: true
    },
    image: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    comments: [comment],
    views: {
        type: Number,
        default: 0
    },
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    }
});

const mediaModelSchema = new Schema({
    media: [media],
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    }
})

module.exports.mediaModel = model('Media', media);