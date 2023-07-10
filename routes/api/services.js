const router = require('express').Router();


router.get('/', async (req, res) => {
    try {
        const services = await servicesModel.find()
        res.status(200).json({ services: services })
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports.servicesRoute = router;