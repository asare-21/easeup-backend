const {
    Schema,
    model
} = require('mongoose');


const locationLogsSchema = new Schema({

    "heading": Number,
    "lat": Number,
    'lng': Number,
    'speed': Number,
    'accuracy': Number,
    'timestamp': {
        type: Date,
        default: Date.now
    }
})

const locationSchema = new Schema({
    logs: {
        type: [locationLogsSchema],
        default: []
    },
    worker: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})


module.exports.locationModel = model('Location Log', locationSchema)

