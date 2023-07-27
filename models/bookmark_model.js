const {
    Schema,
    model
} = require('mongoose');


const bookmarkSchema = new Schema({
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    worker_profile: {
        type: String,
        ref: 'WorkerProfile',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports.bookmarkModel = model('Bookmark', bookmarkSchema);
