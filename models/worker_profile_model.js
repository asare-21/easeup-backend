const {
    Schema,
    model
} = require('mongoose');


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
        type: [String],
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
});