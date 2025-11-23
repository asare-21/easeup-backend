const router = require('express').Router();
const admin = require("firebase-admin");
const { bookingModel } = require('../../models/bookingModel');
const { userModel } = require('../../models/user_model');


router.post('/notifications', async (req, res) => {
    const { message, worker, ref } = req.body;
    if (!message || !worker) {
        return res.status(400).json({ msg: 'Missing fields.', status: 400, success: false })
    }
    // validate worker
    try {
        // Update booking and get client data in parallel
        const [booking, client] = await Promise.all([
            bookingModel.findOneAndUpdate({ worker, ref }, { contactedCustomer: true }, { new: true }),
            bookingModel.findOne({ worker, ref }).then(b => b ? userModel.findById(b.client) : null)
        ]);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found.', status: 404, success: false });
        }

        if (!client) {
            return res.status(404).json({ msg: 'Client not found.', status: 404, success: false });
        }

        // Send notification to client
        await admin.messaging().sendToDevice(client.deviceToken, {
            data: {
                message
            }
        });

        return res.status(200).json({ msg: 'Notification sent.', status: 200, success: true })
    } catch (e) {
        if (e.errorInfo) {
            // Firebase error
            console.log(e.message)
            return res.status(401).json({ msg: e.message, status: 401, success: false })
        }
        return res.status(500).json({ msg: e.message, status: 500, success: false })
    }
})
// route to update call variable

module.exports.jobs = router;