const {
    Schema,
    model
} = require('mongoose');

const addressSchema = new Schema({
    address: {
        type: String,
        default: ''
    },
    latlng: {
        type: Array,
        default: []
    }
})

const userSchema = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },

    profile_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: addressSchema,
        default: {}
    },
    code: {
        type: String,
        default: ""
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
    profile_picture: {
        type: String,
        default: ''
    },
    dob: {
        type: Date,
        default: Date.now
    },
    gender: {
        type: String,
        default: ''
    },
    rooms: {
        type: [String],
        default: []
    },
    ghc_number: {
        type: String,
        default: ''
    },
    ghc_exp: {
        type: String,
        default: ''
    },
    ghc_image: {
        type: Array,
        default: [] // shoild contains the front and back image and image of the worker holding the card to face
    },
})

module.exports.userModel = model('User', userSchema);