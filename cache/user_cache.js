const NodeCache = require("node-cache");
const myCache = new NodeCache(
    {
        stdTTL: 900,
        checkperiod: 120,
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

module.exports.cache = myCache;