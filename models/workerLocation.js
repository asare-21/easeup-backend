const { model, Schema } = require('mongoose')

const pointSchema = Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const workerLocationSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    location
        : {
        type: pointSchema,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
})

workerLocationSchema.index({ location: '2dsphere' });

module.exports.workerLocation = model('workerLocation', workerLocationSchema)