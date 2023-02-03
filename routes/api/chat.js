const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { chatRoomModel } = require('../../models/chatRoomModel');
const { chatModel } = require('../../models/chat_message_model');
const { userModel } = require('../../models/user_model');
const { commonError, returnUnAuthUserError } = require('./user_route')

router.get('/get-chat-room/:id', async (req, res) => {
    try {
        const { type, room } = req.query; // type = worker or user
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ msg: 'No user id provided', status: 400, success: false })
        }
        if (!type) {
            return res.status(400).json({ msg: 'No type provided', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(id)


        chatRoomModel.findOne({ room }, (err, doc) => {
            if (err) {
                return res.status(400).json({ msg: 'Error fetching chat room', status: 400, success: false })
            }
            return res.status(200).json({ msg: 'Chat room fetched', status: 200, success: true, exists: doc ? true : false, data: doc })
        })

    } catch (error) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})



module.exports.chatRoute = router;