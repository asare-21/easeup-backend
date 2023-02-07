const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { getWorkerProfileCache, getWorkerPortfolioCache } = require('../../cache/worker_profile');
const { bookmarkModel } = require('../../models/bookmark_model');
const { commentModel } = require('../../models/comments_model');
const { mediaModel } = require('../../models/mediaModel');
const { reviewModel } = require('../../models/reviews_model');
const { workerProfileModel } = require('../../models/worker_profile_model');
const { commonError, returnUnAuthUserError } = require('./user_route')
const { cache } = require('../../cache/user_cache');
const workerCache = cache;

router.get('/:worker', getWorkerProfileCache, async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if uid is valid
        workerProfileModel.findOne({ worker }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }
            workerCache.set(`worker-profile/${worker}`, result)
            return res.status(200).json({
                msg: 'Worker Profile',
                status: 200,
                success: true,
                worker: result
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

router.get('/reviews/:worker', async (req, res) => {

    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if uid is valid
        reviewModel.findOne({ worker }, (err, worker) => {
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

router.get('/comments/:worker/:post', async (req, res) => {

    const { worker, post } = req.params


    // check if user is authenticated
    try {

        await admin.auth().getUser(worker) // check if uid is valid
        commentModel.find({ post }, (err, posts) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Comments fetched',
                status: 200,
                success: true,
                posts
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
router.post('/comments/:worker', async (req, res) => {

    const { worker } = req.params
    const { comment, post, from } = req.body

    // check if user is authenticated
    try {
        if (!comment) return commonError(res, 'No comment provided')
        if (!post) return commonError(res, 'No post provided')
        if (!from) return commonError(res, 'No from provided')

        await admin.auth().getUser(worker) // check if uid is valid
        const newComment = new commentModel({
            comment,
            post,
            from
        })

        newComment.save((err, comment) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Comment Added',
                status: 200,
                success: true,
                comment
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
        if (!skills) return commonError(res, 'No skills provided')
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findOneAndUpdate({ worker }, {
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
        if (!bio) return commonError(res, 'No bio provided')
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findOneAndUpdate({ worker }, {
            bio
        }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }
            workerCache.set(`worker-profile/${worker}`, {
                ...result,
                bio
            })
            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker: result
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
router.post('/instagram', async (req, res) => {
    const { worker, ig } = req.body
    try {
        if (!ig) return commonError(res, 'No username provided')
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                'links.instagram': ig
            }
        }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }
            workerCache.set(`worker-profile/${worker}`, {
                ...result,
                ig
            })
            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker: result
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
router.post('/twitter', async (req, res) => {
    const { worker, twitter } = req.body
    try {
        if (!twitter) return commonError(res, 'No username provided')
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                'links.twitter':
                    twitter

            }
        }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }
            workerCache.set(`worker-profile/${worker}`, {
                ...result,
                twitter
            })
            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker: result
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
    const { worker, media, description, thumbnail, image } = req.body
    try {
        if (!media && !description) return commonError(res, 'No media provided');
        await admin.auth().getUser(worker) // check if worker is valid
        mediaModel.find({ worker }, (err, result) => {
            if (err) {
                console.log(err)
                return commonError(res, err.message)
            }

            if (result.length === 0) {
                const newMedia = new mediaModel({
                    worker,
                    media: {
                        url: media,
                        description,
                        image,
                        thumbnail
                    },
                })
                newMedia.save((err, worker) => {
                    if (err) {
                        console.log(err)
                        return commonError(res, err.message)
                    }
                    // workerCache.set(`worker-profile/${worker}`, {
                    //     ...result,
                    //     twitter
                    // })
                    return res.status(200).json({
                        msg: 'Worker Profile Updated',
                        status: 200,
                        success: true,
                        worker
                    })
                })
            } else {
                mediaModel.findOneAndUpdate({ worker }, {
                    $push: {
                        media: {
                            url: media,
                            description,
                            image,
                            thumbnail
                        }
                    }
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

router.get('/portfolio/:worker', getWorkerPortfolioCache, async (req, res) => {
    const { worker } = req.params
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        mediaModel.findOne({ worker }, (err, posts) => {
            if (err) {
                console.log(err)
                return commonError(res, err.message)
            }
            workerCache.set(`portfolio/${worker}`, JSON.stringify(posts))
            return res.status(200).json({
                msg: 'Worker Profile Fetched Successfully',
                status: 200,
                success: true,
                worker: posts
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
        if (!radius) return commonError(res, 'No radius provided')
        await admin.auth().getUser(worker) // check if worker is valid
        if (radius.radius > 50 || radius.radius < 5) return commonError(res, 'Radius must be between 5 and 50')
        workerProfileModel.findOneAndUpdate({ worker }, {
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