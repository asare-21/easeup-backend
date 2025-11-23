const { redisClient } = require("./user_cache");

module.exports.serviceCache = async function serviceCache(req, res, next) {
    try {
        const services = await redisClient.get(`services`);
        if (services !== null && services !== undefined) {
            return res.status(200).json({
                msg: 'services found', status: 200, success: true, services: JSON.parse(services)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

