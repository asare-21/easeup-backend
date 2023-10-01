const { redisClient } = require("./user_cache");



module.exports.mediaCache = async function mediaCache(req, res, next) {
    const page = req.params.page || 1; // if page is not defined, set it to 1
    const worker = await redisClient.get(`portfolio/${req.params.page}/${req.params.worker}`); // get the worker portfolio from cache based on page
    if (worker !== null && worker !== undefined) {
        return res.status(200).json({
            msg: 'worker portfolio Found', status: 200, success: true, worker: JSON.parse(worker)
        })
    }
    console.log('Worker portfolio not found in cache');
    next();
}

