const { Schema, model } = require('mongoose')


const IntroSchema = Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    subtitle: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    url: {
        type: String,
        trim: true,
        required: true
    },
    user: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports.introModel = model('Intro', IntroSchema)