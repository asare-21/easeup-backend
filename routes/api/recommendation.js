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
        const foundWorkers = await workerLocation.find({
            location: {
                $near: {
                    $maxDistance: 10000,
                    $geometry: {
                        type: 'Point',
                        coordinates: coords
                    },
                }
            },
            service: service
        })

        // if no worker is found
        if (foundWorkers.length === 0) return res.json({
            success: false,
            message: 'No worker found'
        })


        // extract the rejected worker from the found workers
        const filteredWorkers = foundWorkers.filter((worker) => !rejected.includes(worker.uid))

        // sort the workers based on their rating
        const recommended = filteredWorkers.sort((a, b) => {
            console.log("a ", a)
            if (b.rating !== a.rating) {
                return b.rating - a.rating; // Higher rating first
            } else {
                const distanceA = calculateDistance(coords, a.location.coordinates);
                const distanceB = calculateDistance(coords, b.location.coordinates);
                if (distanceA !== distanceB) {
                    return distanceA - distanceB; // Closer distance first
                } else {
                    return b.createdAt - a.createdAt; // More recent last seen first
                }
            }
        });

        console.log("Recommended ", recommended)
        // send only recommended worker name, rating, coords,id, and base price
        if (recommended.length === 0) return res.json({
            success: false,
            message: 'No worker found'
        })

        const data = {
            name: recommended[0].name,
            rating: recommended[0].rating,
            coords: recommended[0].location,
            id: recommended[0].uid,
            basePrice: recommended[0].basePrice,
            service: recommended[0].service
        }

        return res.json({
            success: true,
            data
        })
    }
    catch (e) {
        return commonError(res, e.message)
    }
})

function calculateDistance(coords1, coords2) {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const earthRadius = 6371; // Radius of the Earth in kilometers

    // Convert coordinates to radians
    const radLat1 = toRadians(lat1);
    const radLon1 = toRadians(lon1);
    const radLat2 = toRadians(lat2);
    const radLon2 = toRadians(lon2);

    // Haversine formula
    const deltaLat = radLat2 - radLat1;
    const deltaLon = radLon2 - radLon1;
    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = earthRadius * c;

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

module.exports.recommendationRoute = router;