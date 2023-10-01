const { advertCache } = require('../../cache/advert_cache');
const { redisClient, DEFAULT_EXPIRATION } = require('../../cache/user_cache');
const { advertModel } = require('../../models/advert_model');
const { verifyJWT } = require('../../passport/common');

const router = require('express').Router();

router.get('/', verifyJWT, advertCache, async (req, res) => {
    try {
        const adverts = await advertModel.find()


        if (!adverts) return res.json({
            success: false,
            adverts: []
        })
        // set cache
        await redisClient.setEx(`worker-token/${result._id}`, DEFAULT_EXPIRATION, JSON.stringify(adverts)); //cache results
        return res.json({
            success: true,
            adverts: adverts
        })

    } catch (e) {
        console.error(e)
        return res.status(401).json({
            success: false, message: "something went wrong"
        })
    }
})

router.post("/create", verifyJWT, async (req, res) => {
    try {
        // used too create job requests
        const user = req.user // extract user from header.
        const body = req.body
        const advert = advertModel({
            bgImg: body.bgImg,
            title: body.title,
            subtitle: body.subtitle,
            route: body.route,
            url: body.url
        })
        // save
        await advert.save()
        return res.json({
            success: true,
            message: "Advert created successfully"
        })
    } catch (e) {
        console.error(e)
        return res.status(401).json({
            success: false, message: "something went wrong"
        })
    }
})

module.exports.advertRoute = router;