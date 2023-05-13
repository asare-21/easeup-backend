const router = require('express').Router();
const { workerModel } = require('../../models/worker_models');
const { notificationModel } = require('../../models/nofications');
const admin = require("firebase-admin");
const log = require('npmlog')
const { commonError, returnUnAuthUserError } = require('../api/user_route');
const { workerProfileModel } = require('../../models/worker_profile_model');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');
const { locationModel } = require("../../models/workerLocationModel");
const { getWorkerCache, getWorkerTokenCache } = require('../../cache/worker_cache');
const { cache } = require('../../cache/user_cache');
const { userModel } = require('../../models/user_model');
const workerCache = cache;

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

router.get('/:worker', getWorkerCache, async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const result = await workerModel.findById(worker)

        workerCache.set(`worker/${worker._id}`, result); //cache results

        return res.status(200).json({
            msg: 'Worker Profile',
            status: 200,
            success: true,
            worker: result
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
router.get('/token/:worker', getWorkerTokenCache, async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const result = await workerModel.findById(worker)

        workerCache.set(`worker-token/${result._id}`, result.token); //cache results

        await admin.messaging().sendToDevice(result.token, {
            notification: {
                title: 'New job request',
                body: 'You have a new job request from a user. Please check and accept or reject the request as soon as possible.'
            }
        })

        return res.status(200).json({
            msg: 'Worker Profile',
            status: 200,
            success: true,
            // token: result.token
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
        const existingUser = await userModel.findById(req.body.worker)
        if (existingUser) return res.status(400).json({ msg: 'An account with this email exists as a client. Sign in request denied.', status: 400, success: false }) // At least one field is required
        const { worker, email, profile_name, last_login, token } = req.body;
        // console.log(req.body)
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
            return res.status(200).json({ user: userExists, msg: 'An account with this email exists as a client. Sign in request denied.', status: 200, success: true })
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
            workerCache.set(`worker/${worker}`, {
                email,
                name: profile_name,
                last_login,
                _id: worker, // firebase worker. Required
                token,
                phone: req.body.phone || '',
                address: req.body.address || {},
                profile_picture: req.body.profile_picture || ''
            }
            );

            await userProfile.save(
                async (err) => {
                    if (err) {
                        console.log(err)
                        await workerModel.findOneAndDelete({ worker })
                        // return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error

                    }
                }
            );
            await userVerification.save(
                async (err) => {
                    if (err) {
                        console.log(err)
                        await workerModel.findOneAndDelete({ worker })
                        await workerProfileModel.findByIdAndDelete({ worker })   // return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                    }
                }
            );
            // create notification
            await createNotification(worker, 'Welcome to Easeup', "We're glad to have you on board. Enjoy your stay", 'welcome', token)
            // // send notification to update user profile
            await createNotification(worker, 'Update your profile', "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience", 'update_profile', token)
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

router.post('/location', async (req, res) => {
    try {
        /*
        *     "heading": Number,
    "lat": Number ,
    'lng': Number,
    'speed': Number,
    'accuracy': Number,
    'timestamp': Date.now
        * */
        const required_fields = ["updates", "worker"]
        var missing_fields = []
        // check for required fields
        for (let i = 0; i < required_fields.length; i++) {
            if (!req.body[required_fields[i]]) {
                missing_fields.push(required_fields[i])
            }
        }
        if (missing_fields.length > 0) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false, missing_fields }) // At least one field is required
        const { worker, updates } = req.body;
        await admin.auth().getUser(worker)
        locationModel.findOneAndUpdate({ worker }, {
            $push: {
                logs: updates
            }
        }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }

            if (!result) {
                //create and update
                locationModel({
                    worker,
                    logs: updates
                }).save((err) => {
                    if (err) return res.status(400).json({ msg: 'Something went wrong', success: false })

                })

            }
            return res.json({ success: true })

        })

    } catch (e) {
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
        workerModel.findByIdAndUpdate
            (user_id, {
                token
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'Worker Not Found', status: 404, success: false }) // User Not Found
                workerCache.del(`worker/${user_id}`);

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
        workerProfileVerificationModel.findOneAndUpdate
            ({ worker: user_id }, {
                // ghc_image: ghc,
                gh_card_to_face: ghc[0],
                gh_card_image_back: ghc[1],
                gh_card_image_front: ghc[2],
                ghc_number: ghc_n,
                ghc_exp: ghc_exp
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                cache.del(`worker/${user_id}`);

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

module.exports.workerRoute = router
