const { workerModel } = require('../../models/worker_models');
const { workerProfileModel } = require('../../models/worker_profile_model');

const router = require('express').Router();


router.get('/workers', async (req, res) => {
    const workers = await workerModel.find()
    return res.status(200).json({
        msg: 'Workers',
        status: 200,
        success: true,
        workers
    })
})

router.get('/worker-profile', async (req, res) => {
    const workerProfiles = await workerProfileModel.find()
    return res.status(200).json({
        msg: 'Worker Profiles',
        status: 200,
        success: true,
        workerProfiles
    })
})

router.get('/reviews', async (req, res) => {
    const reviews = await reviewModel.find()
    return res.status(200).json({
        msg: 'Reviews',
        status: 200,
        success: true,
        reviews
    })
})

router.get('/users', async (req, res) => {
    const users = await userModel.find()
    return res.status(200).json({
        msg: 'Users',
        status: 200,
        success: true,
        users
    })
})

module.exports.dashboard = router
