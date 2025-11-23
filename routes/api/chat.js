const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { chatRoomModel } = require('../../models/chatRoomModel');
const { chatModel } = require('../../models/chat_message_model');
const { userModel } = require('../../models/user_model');
const { workerModel } = require('../../models/worker_models');
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

        const doc = await chatRoomModel.findOne({ room }).exec();
        return res.status(200).json({ 
            msg: 'Chat room fetched', 
            status: 200, 
            success: true, 
            exists: doc ? true : false, 
            data: doc 
        })

    } catch (error) {
        if (error.errorInfo) {
            log.warn(error.message)
            return res.status(401).json({ msg: error.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: error.message, status: 500, success: false })
    }
})
router.get('/rooms/:id', async (req, res) => {
    try {
        const { type } = req.query; // type = worker or user
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ msg: 'No user id provided', status: 400, success: false })
        }
        if (!type) {
            return res.status(400).json({ msg: 'No type provided', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(id)

        let userWorker = type === 'worker' ? 'worker' : 'user';

        const rooms = await chatRoomModel.find({ [userWorker]: id }).exec();
        return res.status(200).json({ msg: 'Chat rooms fetched', status: 200, success: true, rooms })

    } catch (error) {
        if (error.errorInfo) {
            log.warn(error.message)
            return res.status(401).json({ msg: error.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: error.message, status: 500, success: false })
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
        
        const doc = await chatModel.findOneAndUpdate({
            _id: id,
            from,
            user,
            type,
            room,
            worker
        }, {
            is_read: true
        }, { new: true }).exec();
        
        return res.status(200).json({ msg: 'Message status updated', status: 200, success: true, doc })
    } catch (error) {
        if (error.errorInfo) {
            log.warn(error.message)
            return res.status(401).json({ msg: error.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: error.message, status: 500, success: false })
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
        
        const messages = await chatModel.find({ room })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .exec();
        
        return res.status(200).json({ msg: 'Messages fetched', status: 200, success: true, messages })
    }
    catch (error) {
        if (error.errorInfo) {
            log.warn(error.message)
            return res.status(401).json({ msg: error.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: error.message, status: 500, success: false })
    }
})

router.delete('/delete-room/:id', async (req, res) => {
    // delete chat room
    // delete room from worker and user
    const { id } = req.params;
    const { room, user, worker } = req.query;

    try {
        if (!id) {
            return res.status(400).json({ msg: 'No user id provided', status: 400, success: false })
        }
        if (!room) {
            return res.status(400).json({ msg: 'No room provided', status: 400, success: false })
        }
        if (!user) {
            return res.status(400).json({ msg: 'No user provided', status: 400, success: false })
        }
        if (!worker) {
            return res.status(400).json({ msg: 'No worker provided', status: 400, success: false })
        }
        // check if user is authenticated
        await admin.auth().getUser(id)
        
        const doc = await chatRoomModel.findOneAndDelete({ room }).exec();
        if (!doc) {
            return res.status(400).json({ msg: 'No chat room found', status: 400, success: false })
        }
        
        await Promise.all([
            userModel.findOneAndUpdate({ _id: user }, { $pull: { rooms: room } }),
            workerModel.findOneAndUpdate({ _id: worker }, { $pull: { rooms: room } })
        ]);
        
        return res.status(200).json({ msg: 'Chat room deleted', status: 200, success: true })
    } catch (error) {
        if (error.errorInfo) {
            log.warn(error.message)
            return res.status(401).json({ msg: error.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: error.message, status: 500, success: false })
    }
})

module.exports.chatRoute = router;