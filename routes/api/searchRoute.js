const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { workerProfileModel } = require('../../models/worker_profile_model');
const { commonError, returnUnAuthUserError } = require('./user_route')
const pageLimit = 50;
const fs = require('fs')

// search function
function getDistance(coord1, coord2) {
    const radius = 6371; // Earth's radius in kilometers
    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
}

router.post('/', async (req, res) => {
    // search for service
    const required_fields = ['service', 'uid', "page", "radius", "location"]

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

    const { service, uid, page, radius, location } = req.body
    // check if user is authenticated
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        // search for workers in the service
        await workerProfileModel.find({
            skills: {
                $in: [service]
            }
        }, (err, workers) => {
            if (err) {
                console.log(err)
                return commonError(res, err.message)
            }
            // filter workers by distance
            const filteredWorkers = workers.filter(worker => {
                const distance = getDistance(worker.location, location)
                return distance <= radius
            })
            // Filtered
            return res.status(200).json({
                msg: 'Workers found',
                status: 200,
                success: true,
                workers:filteredWorkers
            })
        }).limit(pageLimit).skip((page - 1) * pageLimit) // paginate the results
    }
    catch (e) {
        log.warn(e.message)
        console.log(e.message)
        if (e.errorInfo) {
            // User Not Found

            return returnUnAuthUserError(res, e.message)
        }else{
            // return commonError(res, e.message)

        }
    }
})


module.exports.searchRoute = router;