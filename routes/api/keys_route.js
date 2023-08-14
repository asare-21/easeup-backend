const { keyModel } = require('../../models/key_model');
const { verifyJWT } = require('../../passport/common');

const router = require('express').Router();

router.get("/", verifyJWT, async (req, res) => {
    const keys = await keyModel.find()

    if (!keys) return res.status(404).json({ message: "No keys found", success: false })

    return res.status(200).json({ message: "Keys found", success: true, keys })
})

module.exports.keysRoute = router;