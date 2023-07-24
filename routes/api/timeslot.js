const { verifyJWT } = require("../../passport/common");
const { timeslotModel } = require("../../models/timeslot_model");
const { workerModel } = require("../../models/worker_models");

const router = require("express").Router();

router.get('/all', verifyJWT, async (req, res) => {
    try {
        // check if is worker
        const exists = await workerModel.findById(req.user.id)
        if (!exists) return res.status(500).json({
            success: false,
            msg: "You are not a worker"
        })
        const slots = await timeslotModel.find({ worker: req.user.id })

            .populate('bookingId').sort({ date: "desc" }).exec()

        if (!slots) return res.status(500).json({
            success: false,
            msg: "No slots"
        })

        return res.status(200).json({
            success: true,
            slots
        })

    } catch (e) {
        return res.status(500).json({ message: e.message })

    }
})

router.post("/create", verifyJWT, async (req, res) => {
    try {
        const { date, startTime, endTime, event, title, endDate } = req.body
        // check if the id is a worker
        const exists = await workerModel.findById(req.user.id)
        if (!exists) return res.status(500).json({
            success: false,
            msg: "You are not a worker"
        })
        console.log("Worker id ", req.user.id)
        const slot = await timeslotModel.create({
            worker: req.user.id,
            date,
            startTime,
            endTime,
            event,
            title,
            endDate
        })

        if (!slot) return res.status(500).json({
            success: false,
            msg: "Failed to create slot"
        })

        return res.status(200).json({
            success: true,
            slot
        })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.get("/slot/:id", verifyJWT, async (req, res) => {
    try {
        // check if the id is a worker
        const exists = await workerModel.findById(req.user.id)
        if (!exists) return res.status(500).json({
            success: false,
            msg: "You are not a worker"
        })

        const slot = await timeslotModel.findById(req.params.id)
            .populate('bookingId').exec()

        if (!slot) return res.status(500).json({
            success: false,
            msg: "No slot"
        })

        return res.status(200).json({
            success: true,
            slot
        })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.delete("/del/:id", verifyJWT, async (req, res) => {
    try {
        const { id } = req.params
        // check if the id is a worker
        const exists = await workerModel.findById(req.user.id)
        if (!exists) return res.status(500).json({
            success: false,
            msg: "You are not a worker"
        })

        const slot = await timeslotModel.findByIdAndDelete(id)
        if (!slot) return res.status(500).json({
            success: false,
            msg: "Failed to delete slot"
        })

        return res.status(200).json({
            success: true,
            slot
        })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})


module.exports.timeslotRoute = router