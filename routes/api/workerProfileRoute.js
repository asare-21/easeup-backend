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
const { bookingModel } = require('../../models/bookingModel');
const workerCache = cache;
const { isValidDate } = require('../../utils');
const crypto = require('crypto');
const { workerModel } = require('../../models/worker_models');
const secret = process.env.PAYSTACK_SECRET;

router.get('/:worker', getWorkerProfileCache, async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if uid is valid
        workerProfileModel.findOne({ worker }, (err, result) => {
            if (err) {
                return commonError(res, err.message)
            }
            workerCache.set(`worker-profile/${worker}`, JSON.stringify(result))
            return res.status(200).json({
                msg: 'Worker Profile',
                status: 200,
                success: true,
                worker: result
            })
        })
    }
    catch (e) {
        log.warn(e.message)

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
            // workerCache.set(`worker-profile/${worker}`, {
            //     ...result,
            //     ig
            // })
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
            // workerCache.set(`worker-profile/${worker}`, {
            //     ...result,
            //     twitter
            // })
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
        const posts = await mediaModel.findOne({ worker })

        if (!posts) return commonError(res, 'No portfolio found')

        console.log(posts)

        workerCache.set(`portfolio/${worker}`, JSON.stringify(posts))
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            worker: posts
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


// get timeslots and bookings
router.get('/booking-slot/:worker', async (req, res) => {
    const { worker } = req.params
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const timeslots = await workerSlotModel.findOne({ worker })
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            timeslots,

        })
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

router.get('/booking/:worker', async (req, res) => {
    const { worker } = req.params
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const bookings = await bookingModel.find({ worker })
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,

            bookings
        })
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

// upcoming
router.get('/booking-upcoming/:worker', async (req, res) => {
    const { worker } = req.params
    const { user } = req.query
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const bookings = user ? await bookingModel.find({ client: worker, $eq: { completed: false, cancelled: false, isPaid: true } }) : await bookingModel.find({ worker, $eq: { completed: false, cancelled: false } })
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            bookings
        })
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

//cancelled
router.get('/booking-cancelled/:worker', async (req, res) => {
    const { worker } = req.params
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const bookings = await bookingModel.find({ worker, $eq: { cancelled: true, completed: false, isPaid: true } })
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            bookings
        })
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})
// completed
router.get('/booking-completed/:worker', async (req, res) => {
    const { worker } = req.params
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const bookings = await bookingModel.find({ worker, $eq: { completed: true, isPaid: true } })
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            bookings
        })
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})


router.get('/available-slots/:worker', async (req, res) => {
    try {
        const { worker } = req.params
        const { start } = req.query
        await admin.auth().getUser(worker) // check if worker is valid
        const date = new Date(start)
        if (!isValidDate(new Date(start))) {
            return commonError(res, 'Please provide valid dates. date is invalid.')
        }
        let day = date.getDate() // returns day of the month
        let month = date.getMonth() + 1 //returns the month
        let year = date.getFullYear() // returns the year. January gives 0
        let queryString = `booking.${year}-${month}-${day}` //query the exact day for readings
        const timeslots = await bookingModel.findOne({
            _id: worker,
            [queryString]: {
                $exists: true,
            }
        },)
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            timeslots
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

router.post('/book-slot', async (req, res) => {
    const { worker, client, skills, start, end, name, fee, ref, latlng, image, workerImage } = req.body
    try {
        if (!start || !end) return commonError(res, 'Please provide all required fields. Start and End times are required.')
        //code to check if start and end date are valid
        for (let i = 0; i < 2; i++) {
            if (!isValidDate(new Date(i === 0 ? start : end))) {
                return commonError(res, 'Please provide valid dates. ' + (i === 0 ? 'Start' : 'End') + ' date is invalid.')
            }
        }
        if (!worker || !client || !skills || !name || !fee || !ref || !image || !workerImage) return commonError(res, 'Please provide all required fields. Worker, Client, Skills, Fee...')
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(client) // check if client is valid
        const date = new Date(start)
        let day = date.getDate() // returns day of the month
        let month = date.getMonth() + 1 //returns the month
        let year = date.getFullYear() // returns the year. January gives 0
        let queryString = `booking.${year}-${month}-${day}` //query the exact day for readings
        const booking = await bookingModel.findOneAndUpdate({
            _id: worker,
            [queryString]: {
                $exists: true,
            }
        }, {
            $push: {
                [queryString]: {
                    client,
                    skills,
                    worker,
                    start: new Date(start),
                    name,
                    commitmentFee: fee,
                    ref,
                    latlng, image,
                    endTime: new Date(end),
                    workerImage
                }
            }
        })
        // console.log(booking)
        const newBookingKey = `${year}-${month}-${day}`
        // check if the document exists
        const exists = await bookingModel.findById(worker)
        console.log("Existing model", exists)
        console.log("Fetched model", exists)
        if (!exists && !booking) {
            // create new document
            console.log("Does not exist")
            const bookingSlot = bookingModel({
                _id: worker,
                booking:
                {
                    [newBookingKey]: [{
                        client,
                        skills,
                        worker,
                        start: new Date(start),
                        name,
                        commitmentFee: fee,
                        ref,
                        latlng, image,
                        endTime: new Date(end),
                        workerImage
                    }]
                }

            })
            await bookingSlot.save();

            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker
            })
        }
        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker
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

// webhook to verify payment
router.post('/verify-payment', async (req, res) => {
    const { event, data } = req.body
    try {
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            const success = data.gateway_response === 'Approved' && event === 'charge.success'
            const ref = data.reference
            console.log(data.metadata.custom_fields[4].value)
            const query = `booking.${data.metadata.custom_fields[5].value}.ref`
            const queryPaid = `booking.${data.metadata.custom_fields[5].value}.isPaid`
            if (success) {
                const booking = await bookingModel.findOneAndUpdate({
                    _id: data.metadata.custom_fields[4].value,
                    // select ref from booking array
                    [query]:
                        ref
                },
                    {
                        $set: {
                            [queryPaid]: true
                        }
                    }
                )
                console.log("Found booking ", booking)
                if (!booking) return commonError(res, 'Booking not found')
                // send notification to device of worker and client
                const workerToken = await workerModel.find(booking.worker)
                const userToken = await workerModel.find(booking.client)
                await admin.messaging().sendToDevice(
                    userToken.token,
                    {
                        notification: {
                            title: 'Payment Verified',
                            body: 'Payment for your booking has been verified'
                        }
                    }
                )
                const date = new Date(workerToken.date)
                const parseDate = date.toDateString()
                await admin.messaging().sendToDevice(
                    workerToken.token,
                    {
                        notification: {
                            title: 'Appointment Confirmed',
                            body: workerToken.name + 'has just booked you for ' + parseDate + ' Payment for your booking has been verified. Please check your dashboard for more details'
                        }
                    }
                )
                return res.status(200).json({
                    msg: 'Payment Verified',
                    status: 200,
                })
            }
        }
    } catch (e) {
        return commonError(res, e.message)
    } // "booking.ref": {
    //     $eq: ref
    // },
})

module.exports.workerProfileRoute = router