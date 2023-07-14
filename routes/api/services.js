const { serviceCache } = require('../../cache/services_cache');
const { servicesModel } = require('../../models/services_model');
const { verifyJWT } = require('../../passport/common');

const router = require('express').Router();
const { cache } = require("../../cache/user_cache");

router.get('/', verifyJWT, serviceCache, async (req, res) => {
    try {
        const services = await servicesModel.find()
        if (!services) return res.status(400).json({ message: 'No services found', success: false })
        cache.set(`services`, JSON.stringify(services), 3600);
        return res.status(200).json({ services, success: true })
    } catch (error) {
        return res.status(401).json({ message: error, success: false })
    }
})

module.exports.servicesRoute = router;