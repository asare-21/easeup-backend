const {
    Schema,
    model
} = require('mongoose');


const bookmarkSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker_profile: {
        type: Schema.Types.ObjectId,
        ref: 'WorkerProfile',
        required: true
    },
});

module.exports.bookmarkModel = model('Bookmark', bookmarkSchema);
