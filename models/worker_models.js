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

module.exports.workerModel = model('Worker', workerSchema);