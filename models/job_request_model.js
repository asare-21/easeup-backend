const { Schema, model } = require('mongoose')


const jobrequestSchema = Schema({
    description: {
        required: true,
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    service: [String],
    clientId: {
        type: String,
        requried: true,
        immutable: true
    },
    workerId: {
        type: String,
        requried: true,
        immutable: true
    },
    photos: { type: [String], immutable: true },
    accepted: {
        default: false,
        type: Boolean
    },
    reactedTo: {
        type: Boolean,
        default: false
    }, date: {
        type: String, required: true
    }
})


module.exports.jobRequestModel = model('Job Request', jobrequestSchema)