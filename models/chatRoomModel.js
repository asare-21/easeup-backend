const {
    Schema,
    model
} = require('mongoose');
const { chatMessageSchema } = require('./chat_message_model');

const chatRoomSchema = new Schema({
    roomID: {
        type: String,
        required: true
    },
    messages: {
        type: [chatMessageSchema],
    },
    users: {
        type: [String],
    },
});

