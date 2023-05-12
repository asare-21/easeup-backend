const router = require('express').Router();
const { userModel } = require('../../models/user_model');
const { notificationModel } = require('../../models/nofications');
const admin = require("firebase-admin");
const log = require('npmlog')
const otpGenerator = require('otp-generator')
const axios = require('axios')
const bodyParser = require("body-parser");
const express = require("express");
const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Host: "api.smsonlinegh.com",
    Authorization: `key ${process.env.EASEUP_SMS_API_KEY}`
}

const options = {
    method: "POST",
    headers: headers,
    hostname: "https://api.smsonlinegh.com/v4/message/sms/send",

}
const { getUserCache, cache } = require('../../cache/user_cache');
const { workerModel } = require('../../models/worker_models');
const userCache = cache;

function returnUnAuthUserError(res, msg) {
    console.log(msg)

    return res.status(401).json({ msg: msg, status: 401, success: false })
}
function commonError(res, msg) {
    console.log(msg)
    return res.status(500).json({ msg, status: 500, success: false })
}

async function createNotification(user_id, title, body, type, token) {
    try {   // required field : user_id

        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        userModel.findById(user_id, (
            err,
            user
        ) => {
            if (err) return log.error('Internal Server Error') // Internal Server Error
            if (!user) return log.warn('User Not Found') // User Not Found
            // Create the notification
            const notification = new notificationModel({
                user: user_id,
                title: title,
                message: body,
                type: type,

            })
            notification.save(async (err) => {
                if (err) return log.error(err.message) // Internal Server Error
                // Use token to send a notification to the user
                const message = {
                    notification: {
                        title: title,
                        body: body
                    },
                    token: token
                };
                await admin.messaging().send(message)
                log.info('Notification sent to the user')
                return log.info('Notification created')

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
}

router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.json());

router.get('/profile/:user_id', getUserCache, async (req, res) => {
    try {    // required field : user_id
        const user_id = req.params.user_id;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        userModel.findById(user_id, (err, user) => {
            if (err) {
                log.warn(err.message)
                return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
            }
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            userCache.set(`user/${user_id}`, user);
            return res.status(200).json({
                msg: 'User Found', status: 200, success: true, user
            }) // User Found and returned
        })
    }
    catch (e) {
        if (e.errorInfo) { // User Not Found firebase error
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

router.post('/update/image', (req, res) => {
    try {  // required field : user_id
        const { user_id, profile_picture } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!profile_picture) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                profile_picture: profile_picture
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                // load user from cache and update
                userCache.del(`user/${user_id}`);
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
router.post('/update/address', (req, res) => {
    try {  // required field : user_id
        const { user_id, address, latlng } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!address) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                address: {
                    address,
                    latlng
                }
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                userCache.del(`user/${user_id}`);

                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
router.post('/update/gender', (req, res) => {
    try {  // required field : user_id
        const { user_id, gender } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!gender) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                gender: gender
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                userCache.del(`user/${user_id}`);

                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
router.post('/update/token', (req, res) => {
    try {  // required field : user_id
        const { user_id, token } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!token) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                token
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                userCache.del(`user/${user_id}`);

                return res.status(200).json({
                    msg: 'Profile token updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

router.post('/update/phone', (req, res) => {
    try {  // required field : user_id
        const { user_id, phone } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!phone) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                phone: phone
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                userCache.del(`user/${user_id}`);

                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
router.post('/update/ghc', (req, res) => {
    try {  // required field : user_id
        const { user_id, ghc, ghc_n, ghc_exp } = req.body;
        console.log(req.body)
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(user_id)
        // check for required fields
        if (!ghc) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate
            (user_id, {
                ghc_image: ghc,
                ghc_number: ghc_n,
                ghc_exp: ghc_exp
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                userCache.del(`user/${user_id}`);

                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
        const { user_id, gender, dob, phone, address } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // check for required fields
        if (!req.body.profile_name && !req.body.phone && !req.body.address && !req.body.profile_picture) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        userModel.findByIdAndUpdate(user_id, {
            $set: {
                phone: phone,
                address: address,
                dob: dob,
                gender: gender
            }
        }, (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Update the user
            return res.status(200).json({ msg: 'User Updated', status: 200, success: true }) // User Updated

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
router.post('/phone/send-code', async (req, res) => {
    // 
    try {  // required field : user_id
        const { user_id, phone } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // check for required fields
        if (!phone) return res.status(400).json({ msg: 'Bad Request. Missing fields. phone field is required', status: 400, success: false }) // At least one field is required
        // check if the phone number is equal to the one in the database
        const user = await userModel.findById(user_id)
        if (user.phone.toString() === phone.toString()) return res.status(400).json({ msg: 'Sorry. Operation not allowed', status: 400, success: false }) // At least one field is required

        // Generate OTP and send SMS
        const code = otpGenerator.generate(6, {
            digits: true,
            alphabets: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        })

        const body = {
            messages: [
                {
                    text: `Your EaseUp verification code is ${code}`,
                    type: 1,
                    sender: process.env.EASEUP_SMS_SENDER,
                    destinations: {
                        to: phone
                    },
                },
            ],
        };
        // Send SMS
        const message = `Your Easeup verification code is ${code}`

        const response = await axios.get(`https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`)// wait for the sms to be sent
        console.log(response)
        if (response.data.handshake.label !== "HSHK_OK") return res.json({ msg: 'Handshake error. Access Denied', status: 500, success: false }) // Internal Server Error
        // Find the user
        userModel.findByIdAndUpdate(user_id, {
            code: code
        }, async (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            userCache.del(`user/${user_id}`);

            // Update the user
            return res.status(200).json({ msg: `Verification code has been sent to ${phone}`, status: 200, success: true }) // User Updated
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

router.post('/phone/verify-code', async (req, res) => {
    // 
    try {  // required field : user_id
        const { user_id, phone, code } = req.body;
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // check for required fields
        if (!phone && !code) return res.status(400).json({ msg: 'Bad Request. Missing fields. phone and code fields are required', status: 400, success: false }) // At least one field is required

        // Find the user
        userModel.findById(user_id, async (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Check if code matches
            if (user.code.toString() !== code.toString()) return res.status(400).json({ msg: 'Verification code is incorrect', status: 400, success: false }) // Verification code is incorrect
            // Update the user if code matched
            await userModel.findByIdAndUpdate(user_id, { code: "", phone },)
            userCache.del(`user/${user_id}`);

            return res.status(200).json({ msg: `Code has been verified successfully.`, status: 200, success: true }) // User Updated
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
        const { user_id, email, profile_name, last_login, token } = req.body;
        console.log(req.body)
        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        // required field : email, profile_name, last_login
        await admin.auth().getUser(user_id)
        const required_fields = ["email", "profile_name", "last_login", "token", "user_id"]
        var missing_fields = []
        // check for required fields
        for (let i = 0; i < required_fields.length; i++) {
            if (!req.body[required_fields[i]]) {
                missing_fields.push(required_fields[i])
            }
        }
        if (missing_fields.length > 0) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false, missing_fields }) // At least one field is required
        const existingWorker = await workerModel.findById(user_id).exec()
        if (existingWorker) {
            // Worker Already Exists
            return res.status(400).json({ user: existingWorker, msg: 'An account with this email exists as a worker. Sign in request denied.', status: 400, success: false })
        }
        // check if user already exists
        const userExists = await userModel
            .findOne({ _id: user_id })
            .exec()
        console.log(userExists)
        if (userExists) {
            // User Already Exists
            return res.status(200).json({ user: userExists, msg: 'User exists. Account not created', status: 200, success: true })
        } // User Already Exists
        // Create the user
        const user = new userModel({
            email,
            profile_name,
            last_login,
            _id: user_id, // firebase uid. Required
            token,
            phone: req.body.phone || '',
            address: req.body.address || {},
            email_verified: req.body.email_verified || false,
            profile_picture: req.body.profile_picture || ''
        })
        user.save(async (err) => {
            console.log(err)
            if (err) return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error

            // create notification
            await createNotification(user_id, 'Welcome to Easeup', "We're glad to have you on board. Enjoy your stay", 'welcome', token)
            // send notification to update user profile
            await createNotification(user_id, 'Update your profile', "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience", 'update_profile', token)

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

router.get('/nofications/:user_id', async (req, res) => {
    try {   // required field : user_id
        const { user_id } = req.params;

        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        notificationModel.find({ user: user_id }, (err, notifications) => {
            if (err) return res.status(500).json({ msg: err.message, status: 500, success: false, }) // Internal Server Error
            return res.status(200).json({ msg: 'Notifications Found', status: 200, success: true, notifications }) // Notifications Found and returned
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

router.post('/nofications/update/:user_id', async (req, res) => {
    try {   // required field : user_id
        const { user_id } = req.params;
        const { id } = req.body;

        if (!user_id) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(user_id)
        // Find the user
        notificationModel.findOneAndUpdate({ user: user_id, _id: id }, {
            read: true
        }, (err, notification) => {
            if (err) return res.status(500).json({ msg: err.message, status: 500, success: false, }) // Internal Server Error
            return res.status(200).json({ msg: 'Notification updated', status: 200, success: true, notification }) // Notifications Found and returned
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
module.exports.commonError = commonError;
module.exports.returnUnAuthUserError = returnUnAuthUserError;
module.exports.createNotification = createNotification; 