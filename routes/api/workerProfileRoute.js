const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { bookmarkModel } = require('../../models/bookmark_model');
const { workerProfileModel } = require('../../models/worker_profile_model');

const { commonError, returnUnAuthUserError } = require('./user_route')

router.get('/', async (req, res) => {
    const required_fields = ['uid', "worker_profile_id"]
    const missing_fields = required_fields.filter(field => !req.body[field])
    if (missing_fields.length > 0) {
        // return error of a field is misising
        return res.status(400).json({
            msg: 'Missing fields',
            status: 400,
            success: false,
            missing_fields
        })
    }
    const { uid, worker_profile_id } = req.body

    // check if user is authenticated
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        workerProfileModel.findById(worker_profile_id, (err, worker) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Worker Profile',
                status: 200,
                success: true,
                worker
            })
        })
    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            log.warn(e.message)

            return returnUnAuthUserError(res, e.message)
        }
        return commonError(res, e.message)
    }
})


module.exports.workerProfileRoute = router