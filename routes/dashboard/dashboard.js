const { reviewModel } = require('../../models/reviews_model');
const { userModel } = require('../../models/user_model');
const { workerModel } = require('../../models/worker_models');
const { workerProfileModel } = require('../../models/worker_profile_model');
const admin = require("firebase-admin");
const { returnUnAuthUserError } = require('../api/user_route');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');
const router = require('express').Router();
const cron = require('node-cron');
const axios = require('axios')
const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Host: "api.smsonlinegh.com",
    Authorization: `key ${process.env.EASEUP_SMS_API_KEY}`
}

const options = {
    method: "POST",
    headers: headers,
    hostname: "https://api.smsonlinegh.com/v4/message/sms/send",

}
router.get('/pending/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const workerProfiles = await workerProfileVerificationModel.find({
            skill_verified: false,
            gh_card_verified: false,
            selfie_verified: false,
            insurance_verified: false,
        })
        return res.status(200).json({
            msg: 'Worker Profiles',
            status: 200,
            success: true,
            profiles: workerProfiles,
        })
    } catch (e) {
        console.log(e)
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,
        })

    }
})

router.get('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const users = await userModel.find().count()
        return res.json({
            msg: 'User Profiles',
            status: 200,
            success: true,
            count: users ?? 0
        })
    } catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,
        })

    }
})
router.get('/users/profiles/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const users = await userModel.find()
        return res.json({
            msg: 'User Profiles',
            status: 200,
            success: true,
            profiles: users ?? []
        })
    } catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,
        })

    }
})
router.get('/workers/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const workers = await workerProfileVerificationModel.find({
            skill_verified: true,
            gh_card_verified: true,
            selfie_verified: true,
            insurance_verified: true,
        }).count()

        return res.json({
            msg: 'worker Profiles',
            status: 200,
            success: true,
            count: workers ?? 0
        })
    } catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found

            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching worker profiles',
            status: 400,
            success: false,

        })

    }
})

router.patch('/verify/:uid', async (req, res) => {
    const { ghCard, selfie, insurance, skill, employeeId } = req.body // these are booleans
    const { uid } = req.params
    // only one of these can be true at a time
    // update the worker profile verification model's respective fields when one of the booleans are true
    try {
        await admin.auth().getUser(uid) // verify worker
        await admin.auth().getUser(employeeId) // verify employee

        const workerProfile = await workerProfileVerificationModel.findOne({ worker: uid })
        if (!workerProfile) {
            return res.status(400).json({
                msg: 'Error verifying worker profile',
                status: 400,
                success: false,
            })
        }
        if (ghCard) {
            updateVerificationStatus(workerProfile, 'gh_card', employeeId);
        }

        if (selfie) {
            updateVerificationStatus(workerProfile, 'selfie', employeeId);
        }

        if (insurance) {
            updateVerificationStatus(workerProfile, 'insurance', employeeId);
        }

        if (skill) {
            updateVerificationStatus(workerProfile, 'skill', employeeId);
        }
        await workerProfile.save()
    } catch (e) {

        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error verifying worker profile',
            status: 400,
            success: false,
        })
    }
})


async function sendSMS(destinations) {
    const body = {
        messages: [
            {
                text: `Congratulations! Your Easeup (WorkBuddy) profile has been verified and is ready to rock! Get ready to unleash your skills and start receiving amazing job opportunities.

But wait, there's more! Don't forget to set up your profile, so you can showcase your expertise and stand out from the crowd. Let your personality shine and create a captivating profile that will make clients say, "Wow, I need to work with this superstar!"

Get ready to embark on an exciting journey where opportunities await. With Easeup (WorkBuddy) by your side, success is just a job away. So buckle up and let's make your professional dreams a reality!

Thank you for choosing Easeup (WorkBuddy) - where talent meets opportunity. Let's conquer the world together!`,
                type: 0,
                sender: process.env.EASEUP_SMS_SENDER,
                destinations
            }
        ]

    };
    const headers = {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Host: "api.smsonlinegh.com",
            Authorization:
                `key ${process.env.EASEUP_SMS_API_KEY}`,
        },
    };

    const response = await axios.post("https://api.smsonlinegh.com/v4/message/sms/send", body, headers)// wait for the sms to be sent
    console.log(response.data)
    console.log(response.data.data.messages)
}

function updateVerificationStatus(workerProfile, field, employeeId) {
    workerProfile[`${field}_verified`] = true;
    workerProfile[`${field}_verified_by`] = employeeId;
    workerProfile[`${field}_verified_date`] = Date.now();
}


// Schedule the task to run every 15 minutes
cron.schedule('*/15 * * * *', async () => {

    try {
        const verifiedProfiles = await workerProfileVerificationModel.find({
            gh_card_verified: true,
            selfie_verified: true,
            insurance_verified: true,
            skill_verified: true,
            notified: false,
        });
        const messages = []
        console.log('Verified Profiles:', verifiedProfiles)

        for (const worker of verifiedProfiles) {
            // send notification
            const workerProfile = await workerModel.findById(worker.worker)
            if (!workerProfile) {
                continue
            }
            const message = {
                notification: {
                    title: 'Profile Verification',
                    body: 'Your profile has been verified',
                },
            };

            await admin.messaging().sendToDevice(workerProfile.token, message);
            worker.notified = true; // Update notified field to true
            await worker.save();
            messages.push({
                to: worker.phone
            })
        }
        if (messages.length > 0) {
            // send sms if there are any verified profiles
            await sendSMS(messages)
        }
    } catch (error) {
        console.error('Error notifying verified profiles:', error);
    }
});

module.exports.dashboard = router
