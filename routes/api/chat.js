const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { chatModel } = require('../../models/chat_message_model')
const { commonError, returnUnAuthUserError } = require('./user_route')

router.get('/', async (req, res) => {
    // get all chats
    // sort based on date.
    //show most rescent first
    const required_fields = ['uid', 'page', 'worker_id', 'message', 'sent_by', 'media']
    const missing_fields = required_fields.filter(field => !req.body[field])
    if (missing_fields.length > 0) {
        // return error of a field is misising
        return res.status(400).json({
            msg: 'Missing fields',
            status: 400,
            success: false,
            missing_fields
        })
    }
    const { uid, page, worker_id, message, sent_by, media } = req.body
    // check if user is authenticated
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        // check if worker exists
    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

router.post('/send', (req, res) => {
    // send message
})



module.exports.chatRoute = router;