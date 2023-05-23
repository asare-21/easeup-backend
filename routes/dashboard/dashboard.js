const { reviewModel } = require('../../models/reviews_model');
const { userModel } = require('../../models/user_model');
const { workerModel } = require('../../models/worker_models');
const { workerProfileModel } = require('../../models/worker_profile_model');
const admin = require("firebase-admin");

const router = require('express').Router();

router.get('/pending/:uid', async (req, res) => {
    try {
        const { uid } = req.params.uid
        // verify user
        await admin.auth().getUser(uid)

        const workerProfiles = await workerProfileModel.find({
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
        const { uid } = req.params.uid
        // verify user
        await admin.auth().getUser(uid)

        const users = await userModel.find()
        return res.status(200).json({
            msg: 'User Profiles',
            status: 200,
            success: true,
            profiles: users,
            count: users.length
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



module.exports.dashboard = router
