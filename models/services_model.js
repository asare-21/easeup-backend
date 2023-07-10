const { Schema, model } = require('mongoose')



const servicesSchema = new Schema({
    img: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true

    }
})

const servicesModel = model('services', servicesSchema)

module.exports.servicesModel = servicesModel 