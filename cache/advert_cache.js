const { redisClient } = require('../cache/user_cache')

module.exports.advertCache = async function getintroCache(req, res, next) {
    try {
        const intro = await redisClient.get(`adverts`);

        if (intro !== null && intro !== undefined) {
            return res.status(200).json({
                success: true, adverts: JSON.parse(intro)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}