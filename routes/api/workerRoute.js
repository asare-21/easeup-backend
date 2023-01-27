const router = require('express').Router();
const { workerModel } = require('../../models/worker_models');
const { notificationModel } = require('../../models/nofications');
const admin = require("firebase-admin");
const log = require('npmlog')
const { commonError, returnUnAuthUserError } = require('../api/user_route');
const { workerProfileModel } = require('../../models/worker_profile_model');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');

async function createNotification(worker, title, body, type, token) {
    try {   // required field : worker

        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(worker)
        // Find the user
        workerModel.findById(worker, (
            err,
            user
        ) => {
            if (err) return log.error('Internal Server Error') // Internal Server Error
            if (!user) return log.warn('User Not Found') // User Not Found
            // Create the notification
            const notification = new notificationModel({
                user: worker,
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

router.get('/:worker', async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        workerModel.findById(worker, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Worker Profile',
                status: 200,
                success: true,
                worker
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
    try {   // required field : worker
        const required_fields = ["email", "profile_name", "last_login", "token", "worker"]
        var missing_fields = []
        // check for required fields
        for (let i = 0; i < required_fields.length; i++) {
            if (!req.body[required_fields[i]]) {
                missing_fields.push(required_fields[i])
            }
        }
        if (missing_fields.length > 0) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false, missing_fields }) // At least one field is required
        const { worker, email, profile_name, last_login, token } = req.body;
        console.log(req.body)
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        // required field : email, profile_name, last_login
        await admin.auth().getUser(worker)

        // check if user already exists
        const userExists = await workerModel
            .findOne({ _id: worker })
            .exec()
        console.log(userExists)
        if (userExists) {
            // User Already Exists
            return res.status(200).json({ user: userExists, msg: 'User exists. Account not created', status: 200, success: true })
        } // User Already Exists
        // Create the user
        const user = new workerModel({
            email,
            name: profile_name,
            last_login,
            _id: worker, // firebase worker. Required
            token,
            phone: req.body.phone || '',
            address: req.body.address || {},
            profile_picture: req.body.profile_picture || ''
        })
        const userProfile = new workerProfileModel({
            worker,
            name: profile_name,
        })
        const userVerification = new workerProfileVerificationModel({
            worker,
        })
        user.save(async (err) => {
            console.log(err)
            if (err) {
                console.log(err)
                return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error

            }
            // create notification
            const notification = new notificationModel({
                user: worker,
                title: 'Welcome to Easeup',
                message: "We're glad to have you on board. Enjoy your stay",
                type: 'welcome',
                read: false,
                created_at: new Date()
            })
            await userProfile.save(
                (err)=>{
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error

                    }
                }
            );
            await userVerification.save(
                (err)=>{
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error

                    }
                }
            );
            // create notification
            // await createNotification(worker, 'Welcome to Easeup', "We're glad to have you on board. Enjoy your stay", 'welcome', token)
            // // send notification to update user profile
            // await createNotification(worker, 'Update your profile', "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience", 'update_profile', token)
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

module.exports.workerRoute = router
