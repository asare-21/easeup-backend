const NodeCache = require("node-cache");
const { redisClient } = require("./user_cache");
const admin = require("firebase-admin");

module.exports.getWorkerCache = async function getWorkerCache(req, res, next) {
    // use user id to get user cache
    const worker = await redisClient.get(`worker/${req.params.worker}`);
    console.log('cached worker ', worker);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');
        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, worker
        })
    }
    console.log('Worker not found in cache');
    next();
}

module.exports.getWorkerTokenCache = async function getWorkerTokenCache(req, res, next) {
    // use user id to get user cache
    const worker = await redisClient.get(`worker-token/${req.params.worker}`);
    console.log('cached worker token ', worker);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');

        await admin.messaging().sendToDevice(worker, {
            notification: {
                title: 'New job request',
                body: 'You have a new job request from a user. Please check and accept or reject the request as soon as possible.'
            }
        })

        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, token: worker
        })
    }

    console.log('Worker not found in cache');
    next();
}

// reviews cache
module.exports.getReviewsCache = async function getReviewsCache(req, res, next) {
    const reviews = await redisClient.get(`reviews/${req.params.worker}`);
    console.log('cached reviews ', reviews);
    if (reviews !== null && reviews !== undefined) {
        console.log('Reviews found in cache');
        return res.status(200).json({
            msg: 'Reviews Found', status: 200, success: true, worker: JSON.parse(reviews)
        })
    }
    console.log('Reviews not found in cache');
    next();
};


// comments cache
module.exports.getCommentsCache = async function getCommentsCache(req, res, next) {
    const comments = await redisClient.get(`comments/${req.params.post}`);
    console.log('cached comments ', comments);
    if (comments !== null && comments !== undefined) {
        console.log('Comments found in cache');
        return res.status(200).json({
            msg: 'Comments Found', status: 200, success: true, posts: JSON.parse(comments)
        })
    }
    console.log('Comments not found in cache');
    next();
}

// booking cache
module.exports.getBookingCache = async function getBookingCache(req, res, next) {
    const booking = await redisClient.get(`booking/${req.params.worker}`);
    console.log('cached booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('Booking found in cache');
        return res.status(200).json({
            msg: 'Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('Booking not found in cache');
    next();
}

// get upcoming booking cache
module.exports.getUpcomingBookingCache = async function getUpcomingBookingCache(req, res, next) {
    const booking = await redisClient.get(`upcoming-bookings/${req.params.worker}`);
    console.log('cached upcoming booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('Upcoming Booking found in cache');
        return res.status(200).json({
            msg: 'Upcoming Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('Upcoming Booking not found in cache');
    next();
}
// get Pending booking cache
module.exports.getPendingBookingCache = async function getPendingBookingCache(req, res, next) {
    const booking = await redisClient.get(`pending-bookings/${req.params.worker}`);
    console.log('cached upcoming booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('Pending Booking found in cache');
        return res.status(200).json({
            msg: 'Pending Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('Pending Booking not found in cache');
    next();
}

// get in progress booking cache
module.exports.getInProgressBookingCache = async function getInProgressBookingCache(req, res, next) {
    const booking = await redisClient.get(`in-progress-bookings/${req.params.worker}`);
    console.log('cached in progress booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('In Progress Booking found in cache');
        return res.status(200).json({
            msg: 'In Progress Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('In Progress Booking not found in cache');
    next();
}

// get completed booking cache
module.exports.getCompletedBookingCache = async function getCompletedBookingCache(req, res, next) {
    const booking = await redisClient.get(`completed-bookings/${req.params.worker}`);
    console.log('cached completed booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('Completed Booking found in cache');
        return res.status(200).json({
            msg: 'Completed Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('Completed Booking not found in cache');
    next();
}

// get cancelled cache
module.exports.getCancelledBookingCache = async function getCancelledBookingCache(req, res, next) {
    const booking = await redisClient.get(`cancelled-bookings/${req.params.worker}`);
    console.log('cached cancelled booking ', booking);
    if (booking !== null && booking !== undefined) {
        console.log('Cancelled Booking found in cache');
        return res.status(200).json({
            msg: 'Cancelled Booking Found', status: 200, success: true, bookings: JSON.parse(booking)
        })
    }
    console.log('Cancelled Booking not found in cache');
    next();
}

// get worker review
module.exports.getWorkerReviewCache = async function getWorkerReviewCache(req, res, next) {
    const reviews = await redisClient.get(`worker-review/${req.params.worker}`);

    console.log('cached worker review ', reviews);

    if (reviews !== null && reviews !== undefined) {
        const review = JSON.parse(reviews);

        console.log('Worker Review found in cache');

        return res.status(200).json({
            msg: 'Worker Review Found', status: 200, success: true, review,
            avgRating: review.avgRating,
            total: review.totalReviews
        })
    }
    console.log('Worker Review not found in cache');
    next();
}

// get popoular workers
module.exports.getPopularWorkersCache = async function getPopularWorkersCache(req, res, next) {
    const workers = await redisClient.get(`popular-workers`);
    const highestRated = await redisClient.get(`popular-workers-sorted`);

    console.log('cached popular workers ', workers);

    if (workers !== null && workers !== undefined) {
        const workerResult = JSON.parse(workers);
        console.log('Popular Workers found in cache');
        return res.status(200).json({
            highest: workerResult.highest,
            msg: 'Popular Workers Found',
            status: 200,
            success: true,
            popularServices: workerResult.popularServices,
            profiles: workerResult.profiles,
        })
    }
    console.log('Popular Workers not found in cache');
    next();
}


// paid bookings cache
module.exports.getPaidBookingsCache = async function getPaidBookingsCache(req, res, next) {
    const bookings = await redisClient.get(`paid-bookings/${req.params.user}`);
    console.log('cached paid bookings ', bookings);
    if (bookings !== null && bookings !== undefined) {
        console.log('Paid Bookings found in cache');
        return res.status(200).json({
            msg: 'Paid Bookings Found', status: 200, success: true, bookings: JSON.parse(bookings)
        })
    }
    console.log('Paid Bookings not found in cache');
    next();
}