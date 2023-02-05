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
router.get('/rooms/:id', async (req, res) => {
    try {
        const { type } = req.query; // type = worker or user
        const { id } = req.params;
        console.log(id, type)
        if (!id) {
            return res.status(400).json({ msg: 'No user id provided', status: 400, success: false })
        }
        if (!type) {
            return res.status(400).json({ msg: 'No type provided', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(id)

        let userWorker = type === 'worker' ? 'worker' : 'user';

        chatRoomModel.find({ [userWorker]: id }, (err, rooms) => {
            if (err) {
                return res.status(400).json({ msg: 'Error fetching chat rooms', status: 400, success: false })
            }
            return res.status(200).json({ msg: 'Chat rooms fetched', status: 200, success: true, rooms })
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

// update message status
router.post('/update-message-status', async (req, res) => {
    try {
        const { id, from, user, type, room, worker } = req.body;
        if (!id) {
            return res.status(400).json({ msg: 'No message id provided', status: 400, success: false })
        }
        if (!from || !user || !type || !room) {
            return res.status(400).json({ msg: 'Missing keys', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(from === user ? user : worker)
        chatModel.findAndUpdate({
            _id: id,
            from,
            user,
            type,
            room,
            worker
        }, {
            is_read: true
        }, (err, doc) => {
            if (err) {
                return res.status(400).json({ msg: 'Error updating message status', status: 400, success: false })
            }
            return res.status(200).json({ msg: 'Message status updated', status: 200, success: true, doc })
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

// get messages
router.get('/messages/:id', async (req, res) => {

    try {
        const { room } = req.query; // type = worker or user
        const { id, page } = req.params;
        const pageSize = 100;
        if (!id) {
            return res.status(400).json({ msg: 'No user id provided', status: 400, success: false })
        }

        if (!room) {
            return res.status(400).json({ msg: 'No room provided', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(id)
        chatModel.find({
            room,
        }).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).exec((err, messages) => {
            if (err) {
                return res.status(400).json({ msg: 'Error fetching messages', status: 400, success: false })
            }
            return res.status(200).json({ msg: 'Messages fetched', status: 200, success: true, messages })
        }
        )
    }
    catch (error) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})


module.exports.chatRoute = router;