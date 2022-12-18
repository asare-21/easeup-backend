const {
    Schema,
    model
} = require('mongoose');

const imageSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    sent_by: {
        type: String,
        required: true
    }

});

const chatMessageSchema = new Schema({
    worker: {
        type: Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    is_read: {
        type: Boolean,
        default: false
    },
    sent_by: {
        type: String,
        required: true
    },
    images: {
        type: [imageSchema],
        default: []
    }


});

module.exports = model('ChatMessage', chatMessageSchema);