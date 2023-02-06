const NodeCache = require("node-cache");
const myCache = new NodeCache(
    {
        stdTTL: 900,
        checkperiod: 120,
    }
);
module.exports.getWorkerCache = async function getWorkerCache(req, res, next) {
    // use user id to get user cache
    const worker = myCache.get(`worker/${req.params.worker}`);
    if (worker !== null && worker !== undefined) {
        console.log('Worker found in cache');
        return res.status(200).json({
            msg: 'worker Found', status: 200, success: true, worker
        })
    }
    console.log('Worker not found in cache');
    next();
}