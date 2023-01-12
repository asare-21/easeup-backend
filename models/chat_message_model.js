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
    },
    is_mage: {
        type: Boolean,
        default: false
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
    media: {
        type: [imageSchema],
        default: []
    }


});

module.exports.chatModel = model('ChatMessage', chatMessageSchema);