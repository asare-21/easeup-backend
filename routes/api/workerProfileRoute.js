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
const { userModel } = require('../../models/user_model');
const secret = process.env.PAYSTACK_SECRET;
const https = require('https');
const { query } = require('express');
const { mediaCache } = require('../../cache/media_cache');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');
const { findEarliestAvailableTimeSlot, getMissingField } = require('./booking_helper');


router.get('/:worker', getWorkerProfileCache, async (req, res) => {
    const { worker } = req.params
    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if uid is valid
        const promiseWorker = await workerProfileModel.findOne({ worker })
        const promiseRating = await reviewModel.aggregate([
            {
                $match: { worker }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" }
                }
            }
        ]).exec()
        let avgRating = 0

        if (promiseRating.length > 0) avgRating = promiseRating[0].avgRating ?? 0
        const totalReviews = await reviewModel.countDocuments({ worker })
        promiseWorker.rating = avgRating
        promiseWorker.totalReviews = totalReviews
        promiseWorker.jobs = totalReviews
        // console.log(foundWorker, avgRating, reviews)
        workerCache.set(`worker-profile/${worker}`, JSON.stringify(promiseWorker))
        return res.status(200).json({
            msg: 'Worker Profile',
            status: 200,
            success: true,
            worker: promiseWorker,
            avgRating: avgRating ?? 0,
            totalReviews
        })
    }
    catch (e) {

        if (e.errorInfo) {
            // User Not Found
            console.log(e.message)
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
        const foundWorker = await reviewModel.find({ worker },)
        return res.status(200).json({
            msg: 'Worker Profile',
            status: 200,
            success: true,
            worker: foundWorker
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
        const posts = await commentModel.find({ post },)
        return res.status(200).json({
            msg: 'Comments fetched',
            status: 200,
            success: true,
            posts
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
        await admin.messaging().sendToDevice(workerData.token, {
            notification: {
                title: 'New comment',
                body: `${name} commented on your post`
            },
            data: {
                type: 'comment',
                post
            }
        })
        await newComment.save()
        return res.status(200).json({
            msg: 'Comment Added',
            status: 200,
            success: true,
            comment
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
        const foundWorker = await workerProfileModel.findOneAndUpdate({ worker }, {
            base_price: charge
        })
        workerCache.del(`worker-profile/${worker}`)
        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker: foundWorker
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
        const foundWorker = await workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                skills
            }
        })
        workerCache.del(`worker-profile/${worker}`)
        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker: foundWorker
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
        const foundWorker = await workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                bio
            }
        })
        workerCache.del(`worker-profile/${worker}`)
        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker: foundWorker
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
        const foundWorker = await workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                'links.instagram': ig
            }
        })
        workerCache.del(`worker-profile/${worker}`)

        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker: foundWorker
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
        const foundWorker = await workerProfileModel.findOneAndUpdate({ worker }, {
            $set: {
                'links.twitter':
                    twitter

            }
        },)
        workerCache.del(`worker-profile/${worker}`)

        return res.status(200).json({
            msg: 'Worker Profile Updated',
            status: 200,
            success: true,
            worker: foundWorker
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
        const newMedia = new mediaModel({
            worker,
            url: media,
            description,
            image,
            thumbnail
        })
        newMedia.save((err, worker) => {
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

router.get('/portfolio/:worker/:page', mediaCache, async (req, res) => {
    const { worker, page } = req.params
    const pageSize = 10
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const posts = await mediaModel.find({ worker }).limit(pageSize).skip((page - 1) * pageSize) // get 5 posts per page
        if (!posts) return commonError(res, 'No portfolio found')
        workerCache.set(`portfolio/${page}/${worker}`, JSON.stringify(posts))
        return res.status(200).json({
            msg: 'Worker Profile Media Fetched Successfully',
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

router.get('/paid/:user', async (req, res) => {
    const { user } = req.params
    try {
        await admin.auth().getUser(user) // check if worker is valid
        const bookings = await bookingModel.find({ client: user, isPaid: true })
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
        // console.log("User variable ", user)
        const bookings = user ? await bookingModel.find({ client: worker, isPaid: true, cancelled: false, started: false }) : await bookingModel.find({ worker: worker, isPaid: true, cancelled: false, started: false })
        console.log("Fetched bookings ", bookings)
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            bookings,
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
router.get('/booking-progress/:worker', async (req, res) => {
    const { worker } = req.params
    const { user } = req.query
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        // console.log("User variable ", user)
        const bookings = user ? await bookingModel.find({ 'client': worker, isPaid: true, completed: false, started: true }) : await bookingModel.find({ worker: worker, isPaid: true, completed: false, started: true })
        console.log("Fetched bookings ", bookings)
        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            bookings,
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
    const { user } = req.query
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        const bookings = await bookingModel.find({ [user ? 'client' : 'worker']: worker, isPaid: true, completed: true, started: true })


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
    const { user } = req.query
    console.log(query)
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        // const bookings = await bookingModel.find({ [user == true || 'true' ? 'client' : 'worker']: worker, isPaid: true, completed: false, cancelled: true })
        const bookings = user ? await bookingModel.find({ 'client': worker, isPaid: true, completed: false, cancelled: true }) : await bookingModel.find({ worker, isPaid: true, completed: false, cancelled: true })

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
router.put('/booking-status', async (req, res) => {
    const { worker, client, ref } = req.body
    const { started, completed } = req.query;
    try {

        await Promise.all([
            admin.auth().getUser(worker), // check if worker is valid
            admin.auth().getUser(client) // check if user is valid
        ])
        if (!completed) {
            // check if any bookng has been started but not completed 
            const bookingStarted = await bookingModel.findOne({ worker, client, ref, started: true, completed: false })
            if (bookingStarted) return commonError(res, 'Sorry, you have a booking in progress. Please complete it before starting another booking.')
        }
        const booking = await bookingModel.findOneAndUpdate({
            worker,
            client,
            ref
        }, {
            completed: completed ? completed : false,
            started: started ? started : false,
            endTime: Date.now()
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

// receive worker review
router.post('/worker-review', async (req, res) => {
    const { worker, user, rating, review, userImage, name } = req.body
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(user) // check if user is valid
        const reviewM = new reviewModel({
            worker,
            user,
            rating,
            review,
            name,
            userImage
        },)
        // save review
        await reviewM.save()
        return res.status(200).json({
            msg: 'Reveiw saved',
            status: 200,
            success: true,
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
// get worker reviews
router.get('/worker-review/:worker', async (req, res) => {
    try {
        const worker = req.params.worker
        await admin.auth().getUser(worker) // check if worker is valid

        const reviews = await reviewModel.find({ worker }).limit(80).sort({ date: -1 })
        const avgRating = await reviewModel.aggregate([
            {
                $match: { worker }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" }
                }
            }
        ]).exec()
        const totalReviews = await reviewModel.countDocuments({ worker })
        return res.status(200).json({
            msg: 'Reveiw saved',
            status: 200,
            success: true,
            reviews,
            avgRating: avgRating[0].avgRating ?? 0,
            total: totalReviews
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

router.post('/available-slots/:worker', async (req, res) => {
    try {
        const { workers, day } = req.body;
        const availableSlots = await Promise.all(workers.map(async (workerId) => {
            try {
                await admin.auth().getUser(workerId); // check if worker is valid

                // Get the bookings for the worker on the specified day
                const slots = await bookingModel.find({
                    worker: workerId,
                    day,
                    cancelled: false,
                    completed: false,
                    isPaid: true,
                });

                // Calculate available slots based on the booked slots
                const availableHours = [8, 11, 14]; // Allowed hours: 8am, 11am, 2pm
                const availableSlots = availableHours.filter(hour => {
                    // Check if the worker has a booking at the hour
                    return !slots.some(slot => {
                        const slotHour = new Date(slot.date).getHours();
                        return slotHour === hour;
                    });
                });

                return {
                    workerId,
                    slots: availableSlots,
                    slotCount: availableSlots.length,
                };
            } catch (error) {
                return {
                    workerId,
                    slots: [],
                    slotCount: 0
                };
            }
        }));

        return res.status(200).json({
            msg: 'Worker Profile Fetched Successfully',
            status: 200,
            success: true,
            timeslots: availableSlots,
        });
    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message);
            return returnUnAuthUserError(res, e.message);
        }
        return commonError(res, e.message);
    }
});


router.post('/book-slot', async (req, res) => {
    const { worker, client, skills, name, fee, ref, latlng, image, workerImage, day, photos, clientName, basePrice } = req.body;
    try {
        const missingField = getMissingField({
            worker, client, skills, name, fee, ref, latlng, image, workerImage, day, photos, clientName, basePrice
        });

        if (missingField) {
            return commonError(res, `Please provide the missing field: ${missingField}.`);
        }


        await admin.auth().getUser(worker); // check if worker is valid
        await admin.auth().getUser(client); // check if client is valid

        const start = await findEarliestAvailableTimeSlot(worker, day); // find earliest availble timeslor
        console.log("Generated start time ", start)
        if (!start) {
            return commonError(res, 'No available time slots for the selected day. Please choose another day.');
        }

        const end = new Date(start).getTime() + 2 * 60 * 60 * 1000; // Calculate the end time (2 hours after the start time)
        // get client and worker phone numbers
        const clientPhone = await userModel.findById(client);

        const workerPhone = await workerProfileVerificationModel.findOne({ worker });
        const workerToken = await workerModel.findById(worker)
        // check if the phone numbers are available
        if (!clientPhone.phone || !workerPhone.phone) {
            return commonError(res, 'Phone number not found.');
        }
        const newBooking = new bookingModel({
            worker,
            client,
            start,
            end,
            skills,
            name,
            clientName,
            ref,
            latlng,
            image,
            workerImage,
            commitmentFee: fee,
            day,
            date: start,
            photos,
            basePrice,
            clientPhone: clientPhone.phone,
            workerPhone: workerPhone.phone,
        });

        const result = await newBooking.save(); // save booking

        // Send notifications to the worker and client
        if (workerPhone && clientPhone)
            await Promise.all([
                admin.messaging().sendToDevice(workerToken.token, {
                    notification: {
                        title: 'New Booking',
                        body: 'You have a new booking. Please check your dashboard for more details.'
                    },
                    // token: workerToken.token
                }),
                admin.messaging().sendToDevice(clientPhone.token, {
                    notification: {
                        title: 'New Booking',
                        body: 'Your booking was successful. Awaiting payment.'
                    },
                    // token: clientPhone.token
                })
            ])

        return res.status(200).json({
            msg: 'Booking Successful',
            status: 200,
            success: true,
            result
        });
    } catch (e) {
        console.log("booking error ", e);
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message);
            return returnUnAuthUserError(res, e.message);
        }
        return commonError(res, e.message);
    }
});

// webhook to verify payment
router.post('/verify-payment', async (req, res) => {
    const { event, data } = req.body
    try {
        console.log("------------ Pay stack webhook request body ------------")
        console.log(req.body)
        console.log("------------ Pay stack request headers ------------")
        console.log(req.headers)
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        console.log("------------ Pay stack generated hash ------------")
        console.log(hash)
        console.log("------------ Pay stack request hash ------------")
        console.log(req.headers['x-paystack-signature'])
        console.log("------------ Pay stack hash check equality ------------")
        console.log(hash === req.headers['x-paystack-signature'])
        if (hash === req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            const success = data.gateway_response === 'Approved' || "Successful" && event === 'charge.success'
            const ref = data.reference
            console.log(data)
            console.log(event)
            if (success) {
                const booking = await bookingModel.findOneAndUpdate({
                    ref
                },
                    {
                        isPaid: true
                    }
                )
                console.log("Found booking ", booking)
                if (!booking) return commonError(res, 'Booking not found')
                // send notification to device of worker and client
                const workerToken = await workerModel.findById(booking.worker)
                const userToken = await userModel.findById(booking.client)
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
                            title: 'Booking Confirmed',
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
        return res.status(200).json({
            msg: 'Payment Not Verified',
            status: 200,
        })
    } catch (e) {
        return commonError(res, e.message)
    }
})

router.post('/refund/:ref', async (req, res) => {
    // refund payment and cancel booking.
    // Only refund 60% of the commitment fee
    const { worker, reason } = req.body
    const options = {
        method: 'POST',
        hostname: 'api.paystack.co',
        path: '/refund',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secret}`
        },
    }
    const { ref } = req.params
    try {
        const foundBooking = await bookingModel.findOne({ ref }) // find booking
        // user and worker device tokens to send an alert that the refund has been process and booking cancelled
        const workerToken = await workerModel.findById(worker)
        const userToken = await userModel.findById(foundBooking.client)
        // Set refund details
        const refundDetails = JSON.stringify({
            'transaction': foundBooking.ref,
            // 'amount': (foundBooking.commitmentFee * 100),
        })
        // send notification to device of worker and client
        await admin.messaging().sendToDevice(
            userToken.token,
            {
                notification: {
                    title: 'Refund Processed',
                    body: 'Your booking has been cancelled and refund processed'
                }
            }
        )
        await admin.messaging().sendToDevice(
            workerToken.token,
            {
                notification: {
                    title: 'Sorry, Booking Cancelled',
                    body: 'The customer has cancelled the booking. Please check your dashboard for more details'
                }
            }
        )
        const refundRequest = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            }
            );
            response.on('end', async () => {
                console.log(JSON.parse(data));
                await bookingModel.findOneAndUpdate({ ref, worker }, {
                    cancelled: true,
                    cancelledReason: reason,
                    endTime: Date.now()
                })
                return res.status(200).json({
                    msg: 'Refund Processed',
                    status: 200,
                    success: true,
                })
            }
            );
        })
        refundRequest.write(refundDetails)
        refundRequest.end()

        // find and delete bookng

    }
    catch (e) {
        console.log("Something went wrong ", e);
        return commonError(res, e.message)
    }
})
router.post('/cancel/:ref', async (req, res) => {
    // refund payment and cancel booking.
    const { ref } = req.params
    const { client } = req.body
    const options = {
        method: 'POST',
        hostname: 'api.paystack.co',
        path: '/refund',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secret}`
        },
    }
    try {
        const foundBooking = await bookingModel.findOne({ ref }) // find booking

        // user and worker device tokens to send an alert that the refund has been process and booking cancelled
        const workerToken = await workerModel.findById(foundBooking.worker)
        const userToken = await userModel.findById(client)
        // Set refund details
        const refundDetails = JSON.stringify({
            'transaction': foundBooking.ref,
            'amount': (foundBooking.commitmentFee * 100) * 0.7,
        })
        await Promise.all([
            await admin.messaging().sendToDevice(
                userToken.token,
                {
                    notification: {
                        title: 'Booking Cancelled.',
                        body: 'Your booking has been cancelled successfully. You will a 70% refund within 3-5 working days'
                    }
                }
            ),
            await admin.messaging().sendToDevice(
                workerToken.token,
                {
                    notification: {
                        title: 'Sorry, Booking Cancelled',
                        body: 'The customer has cancelled the booking. Please check your dashboard for more details'
                    }
                }
            )
        ]) // parallel async
        const refundRequest = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            }
            );
            response.on('end', async () => {
                console.log(JSON.parse(data));
                // update booking to cancelled
                await bookingModel.findOneAndUpdate({ ref, }, {
                    cancelled: true,
                    // cancelledReason: reason,
                    endTime: Date.now()
                })
                return res.status(200).json({
                    msg: 'Refund Processed',
                    status: 200,
                    success: true,
                })
            }
            );
        })
        refundRequest.write(refundDetails)
        refundRequest.end()
        // find and delete bookng

    }
    catch (e) {
        console.log("Something went wrong ", e);
        return commonError(res, e.message)
    }
})

router.patch('/update-location', async (req, res) => {
    const { worker, client, location, ref } = req.body

    try {
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(client) // check if worker is valid
        const bookings = await bookingModel.findOneAndUpdate({
            worker,
            client,
            ref
        }, {
            latlng: location
        }, { new: true }).exec()
        if (!bookings) return commonError(res, 'Booking not found')

        console.log(bookings, typeof location[0], typeof location[1])
        // send notification to device of worker and client
        const workerToken = await workerModel.findById(worker)
        const userToken = await userModel.findById(client)
        Promise.all([
            await admin.messaging().sendToDevice(
                userToken.token,
                {
                    notification: {
                        title: 'Location update successfull',
                        body: 'Your location has been updated. We will notify the worker.'
                    }
                }
            ),
            await admin.messaging().sendToDevice(
                workerToken.token,
                {
                    notification: {
                        title: 'Job location update.',
                        body: 'The client has updated their location. Please check your dashboard for more details'
                    }
                }
            )
        ])

        return res.status(200).json({
            msg: 'Address Update Successfull',
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

router.patch('/update-date', async (req, res) => {
    const { worker, client, date, day, ref } = req.body

    try {
        await admin.auth().getUser(worker) // check if worker is valid
        await admin.auth().getUser(client) // check if worker is valid
        const bookings = await bookingModel.findOneAndUpdate({
            worker,
            client,
            ref
        }, {
            date,
            day
        }, { new: true })
        if (!bookings) return commonError(res, 'Booking not found')

        console.log(bookings)
        // send notification to device of worker and client
        const workerToken = await workerModel.findById(worker)
        const userToken = await userModel.findById(client)
        Promise.all([
            await admin.messaging().sendToDevice(
                userToken.token,
                {
                    notification: {
                        title: 'Date update successfull',
                        body: 'New date has been updated. We will notify the worker.'
                    }
                }
            ),
            await admin.messaging().sendToDevice(
                workerToken.token,
                {
                    notification: {
                        title: 'Job date update.',
                        body: 'The client has updated the date and time for the job. Please check your dashboard for more details'
                    }
                }
            )
        ])

        return res.status(200).json({
            msg: 'Update Successfull',
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

router.get("/notify/:worker", async (req, res) => {
    if (!req.params.worker) return commonError(res, "Worker ID not provided")
    try {
        admin.auth().getUser(req.params.worker)
        const workerToken = await workerModel.findById(req.params.worker)
        admin.messaging().sendToDevice(workerToken.token, {
            notification: {
                title: 'Booking request',
                body: 'You have a new booking request. Please check your dashboard to accept/reject the booking.'
            },
            // token: workerToken.token

        })
        return res.status(200).json({
            msg: 'Notification sent',
            status: 200,
            success: true,
        })
    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            console.log(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})

router.get('/popular/:id', async (req, res) => {
    const { id } = req.params;
    let profiles = [];

    try {
        await admin.auth().getUser(id); // check if worker is valid

        const bookings = await bookingModel.find({
            status: 'completed'
        });
        console.log(bookings)
        // Find the most popular services
        const serviceCounts = {};
        const workerCounts = {};

        bookings.forEach(booking => {
            const service = booking.skills;
            const workerId = booking.worker;

            if (serviceCounts[service]) {
                serviceCounts[service]++;
                workerCounts[workerId]++;
            } else {
                serviceCounts[service] = 1;
                workerCounts[workerId] = 1;
            }
        });

        const popularServices = Object.keys(serviceCounts).sort((a, b) => {
            return serviceCounts[b] - serviceCounts[a];
        });

        // Find workers with the highest number of completed bookings
        const sortedWorkers = Object.keys(workerCounts).sort((a, b) => {
            return workerCounts[b] - workerCounts[a];
        });

        console.log("worker: ", sortedWorkers)

        // get the profiles of the sorted workers
        for (const foundWorker of sortedWorkers) {
            const foundProfile = await workerProfileModel.findOne({
                worker: foundWorker
            });

            if (foundProfile) {
                profiles.push(foundProfile);
            }
        }

        return res.json({
            popularServices,
            highest: sortedWorkers,
            profiles,
            success: true
        });

    } catch (e) {
        if (e.errorInfo) {
            // User Not Found
            console.log(e.message);
            return returnUnAuthUserError(res, e.message);
        }
        return commonError(res, e.message);
    }
});


module.exports.workerProfileRoute = router