const router = require('express').Router();
const { userModel } = require('../models/user_model');
const admin = require("firebase-admin");
const log = require('npmlog')

function returnUnAuthUserError(res, msg) {
    return res.status(401).json({ msg: msg, status: 401, success: false })
}
function commonError(res, msg) {
    return res.status(500).json({ msg, status: 500, success: false })
}
router.get('/profile', async (req, res) => {
    try {    // required field : user_id
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)

        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            return res.status(200).json({ msg: 'User Found', status: 200, success: true, user }) // User Found and returned
        })
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

router.post('/update', async (req, res) => {
    try {  // required field : user_id
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // check for required fields
        if (!req.body.name && !req.body.phone && !req.body.address && !req.body.profile_picture) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Update the user
            user.name = req.body.name || user.name
            user.phone = req.body.phone || user.phone
            user.address = req.body.address || user.address
            user.profile_picture = req.body.profile_picture || user.profile_picture
            user.save((err) => {
                if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
                return res.status(200).json({ msg: 'User Updated', status: 200, success: true }) // User Updated
            })
        })
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

router.post('/create', async (req, res) => {
    try {   // required field : user_id
        const { user_id, email, name, last_login } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        // required field : email, name, last_login
        await admin.auth().getUser(user_id)

        if (!email || !name || !last_login) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // Email, Name and Last Login are required
        // check if user already exists
        const userExists = await userModel
            .findOne({ uid: user_id })
            .exec()
        if (userExists) {
            // User Already Exists
            return res.status(200).json({ user: userExists, msg: 'User exists. Account not createdå', status: 200, success: true })
        } // User Already Exists
        // Create the user
        const user = new userModel({
            email,
            name,
            last_login,
            uid: user_id, // firebase uid. Required
            phone: req.body.phone || '',
            address: req.body.address || '',
            email_verified: req.body.email_verified || false,
            profile_picture: req.body.profile_picture || ''
        })
        user.save((err) => {
            if (err) return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
            return res.status(200).json({ msg: 'User Created', status: 200, success: true }) // User Created
        })
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

router.get('/nofications', async (req, res) => {
    try {   // required field : user_id
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Find the notifications
            notificationModel.find({ user: user_id }, (err, notifications) => {
                if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
                return res.status(200).json({ msg: 'Notifications Found', status: 200, success: true, notifications }) // Notifications Found and returned
            })
        })
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

router.get('/bookmarks', async (req, res) => {
    try { // required field : user_id
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Find the bookmarks
            bookmarkModel.find({ user: user_id }, (err, bookmarks) => {
                if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
                return res.status(200).json({ msg: 'Bookmarks Found', status: 200, success: true, bookmarks }) // Bookmarks Found and returned
            })
        })
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

router.delete('/bookmarks/delete', async (req, res) => {
    try {// required field : user_id, bookmark_id
        const { user_id, bookmark_id } = req.body;
        if (!user_id || !bookmark_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID and Bookmark ID are required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Find the bookmark and delete it
            bookmarkModel.findByIdAndDelete(
                bookmark_id,
                (err) => {
                    if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
                    return res.status(200).json({ msg: 'Bookmark Deleted', status: 200, success: true }) // Bookmark Deleted
                }
            )
        })
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
// exports all the routes
module.exports.USER_ROUTE = router;