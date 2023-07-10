const {
    Schema,
    model
} = require('mongoose');


const ContactSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    company: {
        type: String,
        default: 'N/A'
    },
    message: {
        type: String,
        maxlength: 1000,
        required: true
    }
});


module.exports.contactModel = model('Contact', ContactSchema);