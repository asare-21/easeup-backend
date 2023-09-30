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
    url: `rediss://${cacheHostName}:6380`,
    password: cachePassword,

})
// defaul expiration
const DEFAULT_EXPIRATION = 3600

module.exports.getUserCache = async function getUserCache(req, res, next) {
    // use user id to get user cache
    const user = await redisClient.get(`user/${req.params.user_id}`);
    console.log('cached user ', user);

    if (user !== null && user !== undefined) {
        console.log('User found in cache');
        return res.status(200).json({
            msg: 'User Found', status: 200, success: true, user: JSON.parse(user)
        })
    }
    console.log('User not found in cache');
    next();
}

// notifications cache
module.exports.getUserNotificationsCache = async function getNotificationsCache(req, res, next) {
    const notifications = await redisClient.get(`notifications/${req.params.user_id}`);
    console.log('cached notifications ', notifications);
    if (notifications !== null && notifications !== undefined) {
        console.log('Notifications found in cache');
        return res.status(200).json({
            msg: 'Notifications Found', status: 200, success: true,
            notifications: JSON.parse(notifications)
        })
    }
    console.log('Notifications not found in cache');
    next();
}

module.exports.cache = myCache;
module.exports.redisClient = redisClient;
module.exports.DEFAULT_EXPIRATION = DEFAULT_EXPIRATION;