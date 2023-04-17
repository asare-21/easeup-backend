const NodeCache = require("node-cache");
const { cache } = require("./user_cache");
const myCache = cache
const admin = require("firebase-admin");

module.exports.getWorkerCache = async function getWorkerCache(req, res, next) {
    // use user id to get user cache
    const worker = myCache.get(`worker/${req.params.worker}`);
    console.log('cached worker ', worker);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');
        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, worker
        })
    }
    console.log('Worker not found in cache');
    next();
}
module.exports.getWorkerTokenCache = async function getWorkerTokenCache(req, res, next) {
    // use user id to get user cache
    const worker = myCache.get(`worker-token/${req.params.worker}`);
    console.log('cached worker ', worker);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');

        await admin.messaging().sendToDevice(worker, {
            notification: {
                title: 'New job request',
                body: 'You have a new job request from a user. Please check and accept or reject the request as soon as possible.'
            }
        })

        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, token: worker
        })
    }
    console.log('Worker not found in cache');
    next();
}