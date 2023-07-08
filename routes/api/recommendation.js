const router = require('express').Router();
const { workerLocation } = require('../../models/workerLocation');
const { commonError } = require('./user_route')

// Route to recommend workers to users
// Will be done based on user's location and the type of service they need
// Will also be based on the proximity of the worker and the rating
// field may contain rejected workers id
// rejected workers will be removed from the list of workers for recommendation
// The selected worker will be sent to the user

router.post('/suggest', async (req, res) => {
    try {    // coords - user's location
        // service - the service the user needs
        // id - the user's id
        const { coords, service, id, rejected } = req.body;
        // Find all workers that are close to the user
        const foundWorkers = await workerLocation.find({ service }).sort({ createdAt: -1 }).aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: coords
                    },
                    distanceField: "dist.calculated",
                    maxDistance: 10000,
                    includeLocs: "dist.location",
                    spherical: true
                }
            }
        ])
        // extract the rejected worker from the found workers
        const filteredWorkers = foundWorkers.filter(worker => !rejected.includes(worker.id))
        // sort the workers based on their rating
        const recommended = filteredWorkers.sort((a, b) => b.rating - a.rating)

        // send only recommended worker name, rating, coords,id, and base price
        if (recommended.length === 0) return res.json({
            success: false,
            message: 'No worker found'
        })

        const data = {
            name: recommended[0].name,
            rating: recommended[0].rating,
            coords: recommended[0].coords,
            id: recommended[0].uid,
            basePrice: recommended[0].basePrice
        }

        return res.json({
            success: true,
            data
        })
    }
    catch (err) {
        return commonError(res, e.message)
    }
})

module.exports.recommendationRoute = router;