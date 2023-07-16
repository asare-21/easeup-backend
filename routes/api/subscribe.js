const { contactModel } = require('../../models/contact');
const { subscriberModel } = require('../../models/subscriber_model');
const mailer = require('nodemailer')
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

router.post('/mail', async (req, res) => {

    const { email, phone, company, message, name } = req.body;
    if (!email) {
        return res.redirect('https://easeupgh.tech/')
    }
    // validate worker
    try {
        // send notification
        const contact = await
            contactModel.create({ email, phone, company, message, name })

        const response = axios.get(`https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`)// wait for the sms to be sent

        // const sendmail = transporter.sendMail(mailOptions);
        await Promise.all([response])
        //////////////////////////////

        // issue a redirect to the home page
        return res.redirect('https://easeupgh.tech/thank-you')

    } catch (e) {
        return res.redirect('https://easeupgh.tech/')

    }
})

module.exports.subscribeRoute = router;