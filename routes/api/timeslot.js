const { verifyJWT } = require("../../passport/common");
const { timeslotModel } = require("../../models/timeslot_model");
const { workerModel } = require("../../models/worker_models");
const { userModel } = require("../../models/user_model");

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
        // check and make sure the worker has not created a slot for the same date and time
        const slotExists = await timeslotModel.findOne({
            worker: req.user.id,
            date,
            startTime,
            endTime
        })
        if (slotExists) return res.status(500).json({
            success: false,
            msg: "You have already created a slot for this time"
        })
        // check and make sure slot is not in the past and not more than 2 weeks
        const today = new Date()
        const slotDate = new Date(date)
        const diff = slotDate.getTime() - today.getTime()
        const days = diff / (1000 * 3600 * 24)
        if (days < 0) return res.status(500).json({
            success: false,
            msg: "Slot cannot be in the past"
        })
        if (days > 14) return res.status(500).json({
            success: false,
            msg: "Slot cannot be more than 2 weeks"
        })

        // check and make sure slot is not less than 1 hour apart from already created slot
        const slots = await timeslotModel.find({ worker: req.user.id })
        if (slots.length > 0) {
            const slot = slots.find((slot) => {
                const slotDate = new Date(slot.date)
                const diff = slotDate.getTime() - today.getTime()
                const days = diff / (1000 * 3600 * 24)
                if (days < 0) return false
                if (days > 14) return false
                return true
            })
            if (slot) {
                const slotDate = new Date(slot.date)
                const diff = slotDate.getTime() - today.getTime()

                const hours = diff / (1000 * 3600)
                if (hours < 1) return res.json({
                    success: false,
                    msg: "Slot cannot be less than 1 hour apart"
                })
            }
        }

        const slot = await timeslotModel.create({
            worker: req.user.id,
            date,
            startTime,
            endTime,
            event,
            title,
            endDate
        })

        if (!slot) return res.json({
            success: false,
            msg: "Failed to create slot"
        })

        return res.status(200).json({
            success: true,
            slot
        })

    } catch (e) {
        return res.json({ message: e.message })
    }
})

router.get("/slot/:id", verifyJWT, async (req, res) => {
    try {
        // check if the id is a worker
        const exists = await workerModel.findById(req.user.id)
        if (!exists) return res.json({
            success: false,
            msg: "You are not a worker"
        })

        const slot = await timeslotModel.findById(req.params.id)
            .populate('bookingId').exec()

        if (!slot) return res.json({
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
router.get("/worker/slot/:id", verifyJWT, async (req, res) => {
    try {
        // check if the id is a worker
        const exists = await userModel.findById(req.user.id)
        if (!exists) return res.status(500).json({
            success: false,
            msg: "You are not a client"
        })

        const slot = await timeslotModel.find({
            worker: req.params.id
        })
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