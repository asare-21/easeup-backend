const { serviceCache } = require('../../cache/services_cache');
const { servicesModel } = require('../../models/services_model');
const { verifyJWT } = require('../../passport/common');

const router = require('express').Router();
const { cache } = require("../../cache/user_cache");

router.get('/', verifyJWT, serviceCache, async (req, res) => {
    try {
        const services = await servicesModel.find()
            .sort({ name: 1 })
        // await updateServiceData()
        if (!services) return res.status(400).json({ message: 'No services found', success: false })
        cache.set(`services`, JSON.stringify(services), 3600);
        return res.status(200).json({ services, success: true })
    } catch (error) {
        return res.status(401).json({ message: error, success: false })
    }
})

async function updateServiceData() {
    const data = {
        carpenter: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570622/qwwaublddynufb7ixbtp.jpg",
        plumber: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570617/vdzynrc0buqweefozs7n.jpg",
        painter: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570625/f6ygyakcwmaqrwo1vxab.jpg",
        cleaner: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570627/mzi9zmusdwnvc4matqes.jpg",
        electrical: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570629/m1oow4uegjpnjuen44pf.jpg",
        garden: "https://res.cloudinary.com/dl3f5pgro/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1698570616/qbc0tdyvfey9zb15kpjj.jpg"
    }

    Object.keys(data).forEach(async (e) => {
        console.log("Key ", e)
        const update = await servicesModel.findOneAndUpdate({ query: e }, { img: data[e] }, { new: true })
        console.log("Update ", update)
    })
}

module.exports.servicesRoute = router;