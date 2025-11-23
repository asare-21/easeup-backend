const NodeCache = require("node-cache");
const myCache = new NodeCache(
    {
        stdTTL: 60,
        checkperiod: 60,

    }
);
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;
const redis = require('redis')

const redisClient = redis.createClient({
    username: cacheHostName,
    socket: {
        host: 'redis-19218.c261.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 19218
    },
        password: cachePassword,

})
// defaul expiration
const DEFAULT_EXPIRATION = 3600

module.exports.getUserCache = async function getUserCache(req, res, next) {
    try {
        // use user id to get user cache
        const user = await redisClient.get(`user/${req.params.user_id}`);

        if (user !== null && user !== undefined) {
            return res.status(200).json({
                msg: 'User Found', status: 200, success: true, user: JSON.parse(user)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        // Continue to next middleware on cache error
        next();
    }
}

// notifications cache
module.exports.getUserNotificationsCache = async function getNotificationsCache(req, res, next) {
    try {
        const notifications = await redisClient.get(`notifications/${req.params.user_id}`);
        
        if (notifications !== null && notifications !== undefined) {
            return res.status(200).json({
                msg: 'Notifications Found', status: 200, success: true,
                notifications: JSON.parse(notifications)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        // Continue to next middleware on cache error
        next();
    }
}

module.exports.cache = myCache;
module.exports.redisClient = redisClient;
module.exports.DEFAULT_EXPIRATION = DEFAULT_EXPIRATION;