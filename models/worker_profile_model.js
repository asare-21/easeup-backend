const {
    Schema,
    model
} = require('mongoose');

const media = new Schema({
    url: {
        type: String,
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
    }
});

const workRadius = new Schema({
    latlng: {
        type: [Number],
        required: true
    },
    radius: {
        type: Number,
        required: true
    }
})

const workerProfileSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    images: {
        type: [media],
        default: []
    },
    rate_hourly: {
        type: Number,
        default: 0
    },
    is_charge_hourly: {
        type: Boolean,
        default: false
    },
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: 'Review',
        default: []
    },
    work_radius: {
        type: workRadius,
        default: {}
    },
});

module.exports.workerProfileModel = model('WorkerProfile', workerProfileSchema);