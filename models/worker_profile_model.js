const {
    Schema,
    model
} = require('mongoose');
const { reviewSchema } = require('./reviews_model');
const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        // required: true
    }
});
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



const workerProfileSchema = new Schema({
    worker: {
        type: String,
        ref: 'Worker',
        required: true
    },
    profile_url: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    images: {
        type: [media],
        default: [
            {
                url: '',
                image: false,
                description: '',
                thumbnail: '',
                comments: []
            }
        ]
    },
    links: {
        instagram: {
            type: String,
            default: ''
        },
        facebook: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        }
    },
    rating: {
        type: Number,
        default: 0
    },
    jobs: {
        type: Number,
        default: 0
    },
    amount_earned: {
        type: Number,
        default: 0
    },
    is_charge_hourly: {
        type: Boolean,
        default: false
    },
    base_price: {
        type: Number,
        default: 0 // Gh¢ 150.00
    },
    work_radius: {
        type: pointSchema,
        index: "2dsphere",
        default: {
            type: "Point",
            coordinates: [0, 0]
        }
    },
}, {
    timestamps: true
});

workerProfileSchema.index({ work_radius: '2dsphere' });

module.exports.workerProfileModel = model('WorkerProfile', workerProfileSchema);