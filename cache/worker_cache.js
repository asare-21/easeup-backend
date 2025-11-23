const NodeCache = require("node-cache");
const { redisClient } = require("./user_cache");
const admin = require("firebase-admin");

module.exports.getWorkerCache = async function getWorkerCache(req, res, next) {
    try {
        const worker = await redisClient.get(`worker/${req.params.worker}`);
        if (worker !== null && worker !== undefined) {
            return res.status(200).json({
                msg: 'worker Found', status: 200, success: true, worker: JSON.parse(worker)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

module.exports.getWorkerTokenCache = async function getWorkerTokenCache(req, res, next) {
    try {
        const worker = await redisClient.get(`worker-token/${req.params.worker}`);
        if (worker !== null && worker !== undefined) {
            await admin.messaging().sendToDevice(worker, {
                notification: {
                    title: 'New job request',
                    body: 'You have a new job request from a user. Please check and accept or reject the request as soon as possible.'
                }
            })

            return res.status(200).json({
                msg: 'worker Found', status: 200, success: true, token: JSON.parse(worker)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// reviews cache
module.exports.getReviewsCache = async function getReviewsCache(req, res, next) {
    try {
        const reviews = await redisClient.get(`reviews/${req.params.worker}`);
        if (reviews !== null && reviews !== undefined) {
            return res.status(200).json({
                msg: 'Reviews Found', status: 200, success: true, worker: JSON.parse(reviews)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
};


// comments cache
module.exports.getCommentsCache = async function getCommentsCache(req, res, next) {
    try {
        const comments = await redisClient.get(`comments/${req.params.post}`);
        if (comments !== null && comments !== undefined) {
            return res.status(200).json({
                msg: 'Comments Found', status: 200, success: true, posts: JSON.parse(comments)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// booking cache
module.exports.getBookingCache = async function getBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`booking/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get upcoming booking cache
module.exports.getUpcomingBookingCache = async function getUpcomingBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`upcoming-bookings/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'Upcoming Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}
// get Pending booking cache
module.exports.getPendingBookingCache = async function getPendingBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`pending-bookings/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'Pending Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get in progress booking cache
module.exports.getInProgressBookingCache = async function getInProgressBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`in-progress-bookings/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'In Progress Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get completed booking cache
module.exports.getCompletedBookingCache = async function getCompletedBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`completed-bookings/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'Completed Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get cancelled cache
module.exports.getCancelledBookingCache = async function getCancelledBookingCache(req, res, next) {
    try {
        const booking = await redisClient.get(`cancelled-bookings/${req.params.worker}`);
        if (booking !== null && booking !== undefined) {
            return res.status(200).json({
                msg: 'Cancelled Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get worker review
module.exports.getWorkerReviewCache = async function getWorkerReviewCache(req, res, next) {
    try {
        const reviews = await redisClient.get(`worker-review/${req.params.worker}`);

        if (reviews !== null && reviews !== undefined) {
            const review = JSON.parse(reviews);

            return res.status(200).json({
                msg: 'Worker Review Found', status: 200, success: true, review,
                avgRating: review.avgRating,
                total: review.totalReviews
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

// get popoular workers
module.exports.getPopularWorkersCache = async function getPopularWorkersCache(req, res, next) {
    try {
        const workers = await redisClient.get(`popular-workers`);

        if (workers !== null && workers !== undefined) {
            const workerResult = JSON.parse(workers);
            return res.status(200).json({
                highest: workerResult.highest,
                msg: 'Popular Workers Found',
                status: 200,
                success: true,
                popularServices: workerResult.popularServices,
                profiles: workerResult.profiles,
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}


// paid bookings cache
module.exports.getPaidBookingsCache = async function getPaidBookingsCache(req, res, next) {
    try {
        const bookings = await redisClient.get(`paid-bookings/${req.params.user}`);
        if (bookings !== null && bookings !== undefined) {
            return res.status(200).json({
                msg: 'Paid Bookings Found', status: 200, success: true, bookings: JSON.parse(bookings)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

