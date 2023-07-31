const { cache } = require("./user_cache")

module.exports.getintroCache = async function getintroCache(req, res, next) {
    // use intro id to get intro cache
    const intro = cache.get(`intro`);
    console.log('cached intro ', intro);

    if (intro !== null && intro !== undefined) {
        return res.status(200).json({
            success: true, intro
        })
    }
    next();
}
module.exports.getintroUserCache = async function getintroUserCache(req, res, next) {
    // use intro id to get intro cache
    const intro = cache.get(`intro/user`);
    console.log('cached intro ', intro);

    if (intro !== null && intro !== undefined) {
        return res.status(200).json({
            success: true, intro
        })
    }
    next();
}