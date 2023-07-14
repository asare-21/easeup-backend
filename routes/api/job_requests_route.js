const { jobRequestModel } = require('../../models/job_request_model');
const { verifyJWT } = require('../../passport/common');

const router = require('express').Router();

router.get('/jreq', verifyJWT, async (req, res) => {
    try {
        const user = req.user // extract user from header.

        const requests = jobRequestModel.find({
            $or: [
                { clientId: user.id },
                { workerId: user.id }
            ]
        })

        if (!requests) return res.json({
            success: false,
            req: []
        })

        return res.json({
            success: true,
            req: requests
        })

    } catch (e) {
        console.error(e)
        return res.status(401).json({
            success: false, message: "something went wrong"
        })
    }
})

router.post("/jreq_create", verifyJWT, async (req, res) => {
    try {
        // used too create job requests
        const user = req.user // extract user from header.

        // required fields
        // description,service,workerid,photos
        const body = req.body

        if (user.id === body.worker) return res.json({
            success: false,
            message: "You are not authorized to use this route."
        })

        const jobReq = jobRequestModel({
            description: body.description,
            service: body.service,
            workerId: body.worker,
            clientId: user.id,
            photos: body.photos, date: body.date
        })

        // save
        await jobReq.save()

        return res.json({
            success: true, message: "saved"
        })

    } catch (e) {
        console.error(e)
        return res.json({ success: false, message: "something went wrong" })
    }
})

router.delete("/del/:id", verifyJWT, async (req, res) => {
    try {
        // used to delete job requests
        const user = req.user // extract user from header.

        const delRes = await jobRequestModel.deleteOne({ _id: req.params.id, clientId: user.id })
        if (!delRes) return res.json({
            success: false,
            message: "something went wrong"
        })

        return res.json({ success: true, message: "deleted" })

    } catch (e) {
        console.error(e)
        return res.json({
            success: false,
            message: "something went wrong"
        })
    }
})

module.exports.jobRequestRoute = router