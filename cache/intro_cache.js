const { redisClient } = require("./user_cache")

module.exports.getintroCache = async function getintroCache(req, res, next) {
    try {
        const intro = await redisClient.get(`intro`);

        if (intro !== null && intro !== undefined) {
            return res.status(200).json({
                success: true, intro: JSON.parse(intro)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

module.exports.getintroUserCache = async function getintroUserCache(req, res, next) {
    try {
        const intro = await redisClient.get(`intro/user`);

        if (intro !== null && intro !== undefined) {
            return res.status(200).json({
                success: true, intro: JSON.parse(intro)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}