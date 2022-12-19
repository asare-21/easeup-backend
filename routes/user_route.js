const router = require('express').Router();
const { userModel } = require('../models/user_model');


router.get('/profile', (req, res) => {
    // required field : user_id
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
    // Find the user
    userModel.findById(user_id, (err, user) => {
        if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
        if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
        return res.status(200).json({ msg: 'User Found', status: 200, success: true, user }) // User Found and returned
    })
})

router.post('/update', (req, res) => {
    // required field : user_id
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
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
})

router.post('/create', (req, res) => {
    // required field : email, name, last_login
    const { email, name, last_login } = req.body;
    if (!email || !name || !last_login) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // Email, Name and Last Login are required
    // Create the user
    const user = new userModel({
        email,
        name,
        last_login,
        phone: req.body.phone || '',
        address: req.body.address || '',
        email_verified: req.body.email_verified || false,
        profile_picture: req.body.profile_picture || ''
    })
    user.save((err) => {
        if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
        return res.status(200).json({ msg: 'User Created', status: 200, success: true }) // User Created
    })
})

router.get('/nofications', (req, res) => {
    // required field : user_id
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
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
})

router.get('/bookmarks', (req, res) => {
    // required field : user_id
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
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
})

router.delete('/bookmarks/delete', (req, res) => {
    // required field : user_id, bookmark_id
    const { user_id, bookmark_id } = req.body;
    if (!user_id || !bookmark_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID and Bookmark ID are required
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

})
// exports all the routes
module.exports.USER_ROUTE = router;