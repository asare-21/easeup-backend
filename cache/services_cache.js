const { cache } = require("./user_cache");

const myCache = cache


module.exports.serviceCache = async function serviceCache(req, res, next) {
    const services = myCache.get(`services`); // get the worker portfolio from cache based on page
    if (services !== null && services !== undefined) {
        return res.status(200).json({
            msg: ' services found', status: 200, success: true, services: JSON.parse(services)
        })
    }
    next();
}

