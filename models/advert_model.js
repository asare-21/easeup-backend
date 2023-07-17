// String bgImg;
// String title;
// String subtitle;
// String route; // route to navigate to
// String url; // if it is a web url
const { Schema, model } = require('mongoose')

const advertSchema = Schema({
    bgImg: {
        type: String,
        required: true
    },
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
    route: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true
    }
})

module.exports.advertModel = model('Advert', advertSchema)