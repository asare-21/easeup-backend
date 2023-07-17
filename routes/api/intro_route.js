const { getintroCache } = require("../../cache/intro_cache");
const { cache } = require("../../cache/user_cache");
const { introModel } = require("../../models/intro_model");
const { commonError } = require("./user_route");

const router = require("express").Router();

router.get("/", getintroCache, async (req, res) => {
    try {
        const intro = await introModel.find();

        if (!intro) return res.status(404).json({ msg: "No intro found", success: false });
        cache.set(`intro`, intro);
        return res.status(200).json({ intro, success: true });
    }
    catch (e) {
        return commonError(res, e);
    }
})


module.exports.introRoute = router;