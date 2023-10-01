const { redisClient } = require('../cache/user_cache')

module.exports.advertCache = async function getintroCache(req, res, next) {
    // use intro id to get intro cache
    const intro = await redisClient.get(`adverts`);

    if (intro !== null && intro !== undefined) {
        return res.status(200).json({
            success: true, adverts: JSON.parse(intro)
        })
    }
    next();
}