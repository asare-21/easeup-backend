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
        type: String,
        required: false
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
    comments: [comment]
});

const mediaModelSchema = new Schema({
    media: [media],
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    }
})

module.exports.mediaModel = model('Media', mediaModelSchema);