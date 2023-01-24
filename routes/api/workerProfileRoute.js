const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { bookmarkModel } = require('../../models/bookmark_model');
const { workerProfileModel } = require('../../models/worker_profile_model');

const { commonError, returnUnAuthUserError } = require('./user_route')

router.get('/:worker', async (req, res) => {

    const { worker } = req.params

    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if uid is valid
        workerProfileModel.findOne({ worker }, (err, worker) => {
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

router.post('/skills', async (req, res) => {
    const { worker, skills } = req.body
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findByIdAndUpdate({ worker }, {
            skills
        }, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Worker Profile Updated',
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


router.post('/bio', async (req, res) => {
    const { worker, bio } = req.body
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findByIdAndUpdate({ worker }, {
            bio
        }, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Worker Profile Updated',
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

router.post('/portfolio', async (req, res) => {
    const { worker, media } = req.body
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findByIdAndUpdate({ worker }, {
            images: media
        }, (err, worker) => {
            if (err) {
                console.log(err)
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker
            })
        })
    }
    catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

router.post('/work-radius', async (req, res) => {
    const { worker, radius } = req.body
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        if (radius.radius > 50 || radius.radius < 5) return commonError(res, 'Radius must be between 5 and 50')
        workerProfileModel.findByIdAndUpdate({ worker }, {
            work_radius: radius
        }, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }

            return res.status(200).json({
                msg: 'Worker Profile Updated',
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


module.exports.workerProfileRoute = router