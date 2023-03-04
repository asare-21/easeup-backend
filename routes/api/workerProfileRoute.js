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
    const { comment, image, from, post, name } = req.body
    // check if user is authenticated
    try {
        if (!comment) return commonError(res, 'No comment provided')
        if (!post) return commonError(res, 'No post provided')
        if (!from) return commonError(res, 'No from provided')
        if (!image) return commonError(res, 'No image provided')
        if (!name) return commonError(res, 'No name provided')
        await admin.auth().getUser(worker) // check if uid is valid
        const newComment = new commentModel({
            comment,
            image,
            from,
            post,
            name
        })
        // get worker 
        const workerData = await workerModel.findById(worker)
        // send notification to worker
        // await admin.messaging().sendToDevice(workerData.token, {
        //     notification: {
        //         title: 'New comment',
        //         body: `${name} commented on your post`
        //     },
        //     data: {
        //         type: 'comment',
        //         post
        //     }
        // })
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


router.post('/charge', async (req, res) => {
    const { worker, charge } = req.body
    try {
        if (!charge) return commonError(res, 'No skills provided')
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileModel.findOneAndUpdate({ worker }, {
            base_price: charge
        }, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }

            workerCache.del(`worker-profile/${worker}`)


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

            workerCache.del(`worker-profile/${worker}`)

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

            workerCache.del(`worker-profile/${worker}`)

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
            workerCache.del(`worker-profile/${worker}`)

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
                    workerCache.del(`portfolio/${worker}`)
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

                    workerCache.del(`portfolio/${worker}`)

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
        const bookings = await bookingModel.find({ worker, $eq: { cancelled: false, completed: false, isPaid: true } })

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

// update booking status
router.post('/booking-status', async (req, res) => {
    const { worker, client, ref } = req.body
    const bookedDate = req.body.date
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(client) // check if user is valid
        const date = new Date(bookedDate)
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const query = `booking.${year}-${month}-${day}.ref`
        const queryUpdate = `booking.${year}-${month}-${day}.$.completed`
        console.log(query)
        const booking = await bookingModel.findOneAndUpdate({
            _id: worker,
            // [query]: ref
            [query]: ref

        }, {
            [queryUpdate]: true
        },)
        console.log(booking)
        if (!booking) return commonError(res, 'Booking not found')
        return res.status(200).json({
            msg: 'Booking Updated Successfully',
            status: 200,
            success: true,
            booking,
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
        // let queryString = `booking.${year}-${month}-${day}` //query the exact day for readings
        const timeslots = await bookingModel.findOne({
            _id: worker,
        },)
        if (!timeslots) return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            timeslots: []
        })

        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            timeslots: timeslots.booking.get(`${year}-${month}-${day}`) || []
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
    const { worker, client, start, skills, end, name, fee, ref, latlng, image, workerImage } = req.body
    // const d = req.body.date
    try {
        const date = new Date(start)

        if (!date || !end) return commonError(res, 'Please provide all required fields. Start and End times are required.')
        //code to check if start and end date are valid
        if (!isValidDate(new Date(date))) {
            return commonError(res, 'Please provide valid dates.  date is invalid.')
        }
        if (!isValidDate(new Date(end))) {
            return commonError(res, 'Please provide valid dates.  date is invalid.')
        }
        if (!worker || !client || !skills || !name || !fee || !ref || !image || !workerImage) return commonError(res, 'Please provide all required fields. Worker, Client, Skills, Fee...')
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(client) // check if client is valid
        const today = Date.now()

        // return error if date is in the past
        if (today > new Date(date)) return commonError(res, 'Please provide a valid date. Date cannot be in the past.')
        let day = date.getDate() // returns day of the month
        let month = date.getMonth() + 1 //returns the month
        let year = date.getFullYear() // returns the year. January gives 0
        let queryString = `booking.${year}-${month}-${day}` //query the exact day for readings
        let newqueryString = `${year}-${month}-${day}` //query the exact day for readings

        const fetchBookings = await bookingModel.findOne({ _id: worker })
        if (!fetchBookings) {
            // Does not exist. Go ahead and create
            const bookingSlot = bookingModel({
                _id: worker,
                booking:
                {
                    [newqueryString]: [{
                        client,
                        skills,
                        worker,
                        date: new Date(date),
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
            // return response
            return res.status(200).json({
                msg: 'Slot has been booked successfully',
                status: 200,
                success: true,
                worker
            })
        }
        const bookingsFetched = fetchBookings.booking.get(`${year}-${month}-${day}`)
        if (!bookingsFetched) {
            // Does not exist. Go ahead and create
            const bookingSlot = await bookingModel.findOneAndUpdate({
                _id: worker,
            }, {
                $set: {
                    [queryString]: [{
                        client,
                        skills,
                        worker,
                        date: new Date(date),
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
            // return response
            return res.status(200).json({
                msg: 'Slot has been booked successfully',
                status: 200,
                success: true,
                worker
            })
        }
        /////////////////////

        // sort the bookings according to paid

        const paidBookings = bookingsFetched.filter(booking => booking.isPaid === true && booking.completed === false) //filter paid bookings that are not completed
        // sort paid bookings according to start time
        const sortedACTime = paidBookings.sort((a, b) => a.date - b.date)

        console.log("Sorted According To Time", sortedACTime)

        const result = sortedACTime.filter(booking => {
            // check that booking endtime is at least 30 minutes before the new booking start time
            const end = new Date(booking.endTime)
            const newDate = new Date(date)

            console.log('Booking End Time', end.getHours(), end.getMinutes())
            console.log('New Booking Start Time', newDate.getHours(), newDate.getMinutes())
            console.log("Difference", end.getTime() + 1800000 >= newDate.getTime())

            return end.getTime() + 1800000 < newDate.getTime()
            // console.log("This slot is not available. Please choose another slot.")
            // return commonError(res, 'This slot is not available. Please choose another slot.')
        })
        if (result.length === 0) {
            // Slot available
            await bookingModel.findOneAndUpdate({
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
                        date: new Date(date),
                        name,
                        commitmentFee: fee,
                        ref,
                        latlng, image,
                        endTime: new Date(end),
                        workerImage
                    }
                }
            })
            return res.status(200).json({
                msg: 'Worker Profile Updated',
                status: 200,
                success: true,
                worker
            })
        } else {
            // Slot not available
            console.log("This slot is not available. Please choose another slot.")
            return commonError(res, 'This slot is not available. Please choose another slot.')
        }




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
            console.log(data.metadata.custom_fields[5].value)
            const query = `booking.${data.metadata.custom_fields[5].value}.ref`
            const queryPaid = `booking.${data.metadata.custom_fields[5].value}.$.isPaid`
            console.log("Query ", query)
            if (success) {
                const booking = await bookingModel.findOneAndUpdate({
                    _id: data.metadata.custom_fields[4].value,
                    // select ref from booking array
                    [query]:
                    {
                        $exists: true,
                        $eq: ref
                    }
                },
                    {

                        [queryPaid]: true

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
            return res.status(200).json({
                msg: 'Payment Not Verified',
                status: 200,
            })
        }
    } catch (e) {
        return commonError(res, e.message)
    } // "booking.ref": {
    //     $eq: ref
    // },
})

module.exports.workerProfileRoute = router