const { subscriberModel } = require('../../models/subscriber_model');

const router = require('express').Router();


router.post('/', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.redirect('https://easeupgh.tech/')
    }
    // validate worker
    try {
        // send notification
        const subscriber = await
            subscriberModel.create({ email })

        // issue a redirect to the home page
        return res.redirect('https://easeupgh.tech/thank-you')

    } catch (e) {
        return res.redirect('https://easeupgh.tech/')

    }
})