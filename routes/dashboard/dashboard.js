const { reviewModel } = require('../../models/reviews_model');
const { userModel } = require('../../models/user_model');
const { workerModel } = require('../../models/worker_models');
const { workerProfileModel } = require('../../models/worker_profile_model');
const admin = require("firebase-admin");
const { returnUnAuthUserError } = require('../api/user_route');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');

const router = require('express').Router();

router.get('/pending/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const workerProfiles = await workerProfileVerificationModel.find({
            skill_verified: false,
            gh_card_verified: false,
            selfie_verified: false,
            insurance_verified: false,
        })
        return res.status(200).json({
            msg: 'Worker Profiles',
            status: 200,
            success: true,
            profiles: workerProfiles,
            count: workerProfiles.length
        })
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,
        })

    }
})

router.get('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const users = await userModel.find().count()
        return res.json({
            msg: 'User Profiles',
            status: 200,
            success: true,
            count: users ?? 0
        })
    } catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,
        })

    }
})
router.get('/workers/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const workers = await workerModel.find().count()

        return res.json({
            msg: 'worker Profiles',
            status: 200,
            success: true,
            count: workers ?? 0
        })
    } catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found

            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,

        })

    }
})





module.exports.dashboard = router
