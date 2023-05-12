const router = require('express').Router();
const admin = require("firebase-admin");
const { bookingModel } = require('../../models/bookingModel');


router.post('/notifications', async (req, res) => {
    const { message, worker, ref } = req.body;
    if (!message || !worker) {
        return res.status(400).json({ msg: 'Missing fields.', status: 400, success: false })
    }
    // validate worker
    try {
        await admin.auth().getUser(worker)
        // send notification

        // run aysnc in parallel
        await Promise.all([
            admin.messaging().sendToDevice(worker, {
                data: {
                    message
                }
            }),
            // update record to show that customer has been contacted
            bookingModel.findOneAndUpdate({ worker, ref }, { contactedCustomer: true })
        ])

        return res.status(200).json({ msg: 'Notification sent.', status: 200, success: true })
    } catch (error) {
        if (e.errorInfo) {
            // User Not Found
            console.log(e.message)
            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})
// route to update call variable

module.exports.jobs = router;