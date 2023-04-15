const NodeCache = require("node-cache");
const { cache } = require("./user_cache");
const myCache = cache
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
    const worker = myCache.get(`worker/${req.params.worker}`);
    console.log('cached worker ', worker);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');
        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, token: worker.token
        })
    }
    console.log('Worker not found in cache');
    next();
}