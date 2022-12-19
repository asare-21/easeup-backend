const {
    Schema,
    model
} = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },

    name: {
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
        default: false
    },
    date_joined: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date,
        required: true
    },
    profile_picture: {
        type: String,
        default: ''
    },
})

module.exports.userModel = model('User', userSchema);