const {
    Schema,
    model
} = require('mongoose');


const notificationSchema = new Schema({
    user: {
        type: String,
        ref: 'User',
        required: true
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

module.exports.notificationModel = model('Notification', notificationSchema);