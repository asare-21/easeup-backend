const { Schema, model } = require('mongoose');

const keySchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,

    },
    title: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true
})


module.exports.keyModel = model('Key', keySchema);