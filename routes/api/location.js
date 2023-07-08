const router = require('express').Router();
const { workerLocation } = require('../../models/workerLocation');
const { commonError } = require('./user_route')

router.post('/update', async (req, res) => {
    const { id, coords, service, rating, basePrice, name
    } = req.body;

    try {
        // save worker location to database
        const newLocation = new workerLocation({
            uid,
            coords,
            service,
            rating,
            basePrice,
            name
        })
        await newLocation.save()
        return res.json({
            success: true,
            message: 'Location updated'
        })
    }
    catch (err) {
        return commonError(res, err.message)
    }
})

module.exports.location = router;