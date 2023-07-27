const { Schema, model } = require('mongoose')


const IntroSchema = Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subtitle: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: true
})

module.exports.introModel = model('Intro', IntroSchema)