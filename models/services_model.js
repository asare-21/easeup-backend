const { Schema, model } = require('mongoose')



const servicesSchema = new Schema({
    img: {
        type: String,
        required: true
    },
    lottie: {
        type: String,
        required: false,
        default: ""
    },
    query: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const servicesModel = model('services', servicesSchema)

module.exports.servicesModel = servicesModel 