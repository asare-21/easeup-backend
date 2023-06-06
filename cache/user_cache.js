const NodeCache = require("node-cache");
const myCache = new NodeCache(
    {
        stdTTL: 100,
        checkperiod: 100,
    }
);

module.exports.getUserCache = async function getUserCache(req, res, next) {
    // use user id to get user cache
    const user = myCache.get(`user/${req.params.user_id}`);
    console.log('cached user ', user);

    if (user !== null && user !== undefined) {
        console.log('User found in cache');
        return res.status(200).json({
            msg: 'User Found', status: 200, success: true, user
        })
    }
    console.log('User not found in cache');
    next();
}

// notifications cache
module.exports.getUserNotificationsCache = async function getNotificationsCache(req, res, next) {
    const notifications = myCache.get(`notifications/${req.params.user_id}`);
    console.log('cached notifications ', notifications);
    if (notifications !== null && notifications !== undefined) {
        console.log('Notifications found in cache');
        return res.status(200).json({
            msg: 'Notifications Found', status: 200, success: true, notifications
        })
    }
    console.log('Notifications not found in cache');
    next();
}

module.exports.cache = myCache;