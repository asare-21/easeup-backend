const {
    Schema,
    model
} = require('mongoose');

const workerSchema = new Schema({
    _id: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        default: ''
    },
    addres: {
        type: String,
        default: ''
    },
    email_verified: {
        type: Boolean,
        default: true
    },
    date_joined: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date,
        required: true
    },
    profile_verified: {
        type: Boolean,
        default: false
    },
    profile_verified_date: {
        type: Date,
        default: null
    },
    profile_picture: {
        type: String,
        default: ''
    },
    rooms: {
        type: [String],
        default: []
    }
})

module.exports.workerModel = model('Worker', workerSchema);