const {
    Schema,
    model
} = require('mongoose');
const { chatMessageSchema } = require('./chat_message_model');

const chatRoomSchema = new Schema({
    room: {
        type: String,
        required: true
    },
    messages: {
        type: [chatMessageSchema],
    },
    user: {
        type: String,
        required: true
    },
    worker: {
        type: String,
        required: true
    },
    workerName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    workerPhoto: {
        type: String,
        required: true
    },
    userPhoto: {
        type: String,
        required: true
    },
});

const chatRoomModel = model('chatRoom', chatRoomSchema);
module.exports.chatRoomModel = chatRoomModel;

