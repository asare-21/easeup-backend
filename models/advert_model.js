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
        default: '',
        trim: true,
    },
    subtitle: {
        type: String,
        default: '',
        trim: true
    },
    route: {
        type: String,
        default: '',
        trim: true
    },
    url: {
        type: String,
        trim: true,
        required: true
    }
})

module.exports.advertModel = model('Advert', advertSchema)