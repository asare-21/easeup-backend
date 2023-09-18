const {
    Schema,
    model
} = require('mongoose');


const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
})

const notificationWorkerSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Worker'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
})

module.exports.notificationUserModel = model('User Notification', notificationSchema);
module.exports.notificationWorkerModel = model('Worker Notification', notificationWorkerSchema);