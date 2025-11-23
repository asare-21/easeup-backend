const { redisClient } = require("./user_cache");

module.exports.mediaCache = async function mediaCache(req, res, next) {
    try {
        const page = req.params.page || 1;
        const worker = await redisClient.get(`portfolio/${req.params.page}/${req.params.worker}`);
        if (worker !== null && worker !== undefined) {
            return res.status(200).json({
                msg: 'worker portfolio Found', status: 200, success: true, worker: JSON.parse(worker)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

