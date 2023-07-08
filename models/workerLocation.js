const { model, Schema } = require('mongoose')

const workerLocationSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    coords: {
        type: Object,
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
})

module.exports.workerLocation = model('workerLocation', workerLocationSchema)