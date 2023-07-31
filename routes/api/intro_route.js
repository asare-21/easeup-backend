const { getintroCache, getintroUserCache } = require("../../cache/intro_cache");
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
router.get("/user", getintroUserCache, async (req, res) => {
    try {
        const intro = await introModel.find({
            user: true
        });

        if (!intro) return res.status(404).json({ msg: "No intro found", success: false });
        cache.set(`intro/user`, intro);
        return res.status(200).json({ intro, success: true });
    }
    catch (e) {
        return commonError(res, e);
    }
})
if (process.env.NODE_ENV === "development") {
    router.post('/create', async (req, res) => {
        try {
            const { title, subtitle, url, user } = req.body;
            const intro = await introModel.create({
                title, subtitle, url, user
            })
            if (!intro) return res.status(400).json({ msg: "Failed to create intro", success: false });
            return res.status(200).json({ intro, success: true });
        }
        catch (e) {
            return commonError(res, e);
        }
    })
}

module.exports.introRoute = router;