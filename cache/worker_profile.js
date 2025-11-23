const { redisClient } = require("./user_cache");

module.exports.getWorkerProfileCache = async function getWorkerProfileCache(req, res, next) {
    try {
        const worker = await redisClient.get(`worker-profile/${req.params.worker}`);

        if (worker !== null && worker !== undefined) {
            return res.status(200).json({
                msg: 'worker Found', status: 200, success: true,
                worker: JSON.parse(worker),
                avgRating: JSON.parse(worker).rating,
                totalReviews: JSON.parse(worker).jobs
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

module.exports.getWorkerPortfolioCache = async function getWorkerPortfolioCache(req, res, next) {
    try {
        const worker = await redisClient.get(`portfolio/${req.params.worker}`);

        if (worker !== null && worker !== undefined) {
            return res.status(200).json({
                msg: 'worker portfolio Found', status: 200, success: true, worker: JSON.parse(worker),
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}