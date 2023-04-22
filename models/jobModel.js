const { Schema, model } = require('mongoose');

const jobSchema = new Schema({
    client: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    location: {
        type: Array,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    skills: {
        type: Array,
        required: true
    },
    photos: {
        type: Array,
        required: true
    }
});



module.exports.jobModel = model('Job Plan', jobSchema);