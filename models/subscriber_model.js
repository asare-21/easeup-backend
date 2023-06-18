// email subscriber model
const { model, Schema } = require('mongoose')

const subscriberSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports.subscriberModel = model('Subscriber', subscriberSchema)