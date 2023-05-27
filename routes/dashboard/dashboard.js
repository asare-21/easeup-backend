const { reviewModel } = require('../../models/reviews_model');
const { userModel } = require('../../models/user_model');
const { workerModel } = require('../../models/worker_models');
const { workerProfileModel } = require('../../models/worker_profile_model');
const admin = require("firebase-admin");
const { returnUnAuthUserError } = require('../api/user_route');
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');
const router = require('express').Router();
const cron = require('node-cron');
const axios = require('axios');
const { bookingModel } = require('../../models/bookingModel');
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

router.get('/sms/:id', async (req, res) => {
    try {
        await admin.auth().getUser(req.params.id)
        const response = await axios.get(`https://api.smsonlinegh.com/v4/report/balance`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `key ${process.env.EASEUP_SMS_API_KEY}`
            }
        })
        console.log(response.data)
        return res.status(200).json({
            msg: 'SMS Balance',
            status: 200,
            amount: response.data.data.balance.amount ?? 0
        })
    }
    catch (e) {
        console.log(e)
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error sending sms',
            status: 400,
            success: false,
        })
    }
})

router.get('/pending/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        // verify user
        await admin.auth().getUser(uid)

        const workerProfiles = await workerProfileVerificationModel.find({
            $or: [
                { skill_verified: false },
                { gh_card_verified: false },
                { selfie_verified: false },
                { insurance_verified: false }
            ]
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
            updateVerificationStatus(workerProfile, 'gh_card', employeeId, true);
        }

        if (selfie) {
            updateVerificationStatus(workerProfile, 'selfie', employeeId, true);
        }

        if (insurance) {
            updateVerificationStatus(workerProfile, 'insurance', employeeId, true);
        }

        if (skill) {
            updateVerificationStatus(workerProfile, 'skill', employeeId, true);
        }
        await workerProfile.save()
        return res.status(200).json({
            msg: 'Worker Profile Verified',
            status: 200,
            success: true,
        })
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

router.patch('/no-verify/:uid', async (req, res) => {
    const { ghCard, selfie, insurance, skill, employeeId } = req.body // these are booleans
    const { uid } = req.params
    // only one of these can be true at a time
    // update the worker profile verification model's respective fields when one of the booleans are true
    try {
        await admin.auth().getUser(uid) // verify worker
        await admin.auth().getUser(employeeId) // verify employee

        let workerProfile = await workerProfileVerificationModel.findOne({ worker: uid })
        if (!workerProfile) {
            return res.status(400).json({
                msg: 'Error verifying worker profile',
                status: 400,
                success: false,
            })
        }

        if (ghCard) {
            workerProfile = await updateVerificationStatus(workerProfile, 'gh_card', employeeId, false);
            workerProfile.gh_card_image_back = ""
            workerProfile.gh_card_to_face = ""
            workerProfile.gh_card_image_front = ""
            workerProfile.ghc_exp = ""
            workerProfile.ghc_number = ""
        }

        if (selfie) {
            workerProfile = await updateVerificationStatus(workerProfile, 'selfie', employeeId, false);
            workerProfile.selfie = ""


        }

        if (insurance) {
            workerProfile = await updateVerificationStatus(workerProfile, 'insurance', employeeId, false);
            workerProfile.insurance_document = ""

        }

        if (skill) {
            workerProfile = await updateVerificationStatus(workerProfile, 'skill', employeeId, false);
            workerProfile.proof_skill = ""
        }

        await Promise.all([
            rejectionSMS(uid, workerProfile.phone),
            workerProfile.save()
        ])

        return res.status(200).json({
            msg: 'Worker profile rejected',
            status: 200,
            success: true,
        })

    } catch (e) {
        console.log(e)
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

router.get('/completed-bookings/:uid', async (req, res) => {
    try {
        const { uid } = req.params

        await admin.auth().getUser(uid) // verify worker

        const completedBookings = await bookingModel.find({
            completed: true,
        }).count()

        return res.status(200).json({
            msg: 'Completed Bookings',
            status: 200,
            success: true,
            count: completedBookings ?? 0
        })

    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching completed bookings',
            status: 400,
            success: false,
        })
    }
})

router.get('/reviews/:uid', async (req, res) => {
    try {
        const { uid } = req.params

        await admin.auth().getUser(uid) // verify worker

        const reviews = await reviewModel.find().count()

        return res.status(200).json({
            msg: 'reviews',
            status: 200,
            success: true,
            count: reviews ?? 0
        })

    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching reviews',
            status: 400,
            success: false,
        })
    }
})

router.get('/avg-rating/:uid', async (req, res) => {
    try {
        const { uid } = req.params

        await admin.auth().getUser(uid) // verify worker

        const avgRating = await reviewModel.aggregate([
            { $group: { _id: null, rating: { $avg: '$rating' } } },
            { $project: { _id: 0, rating: 1 } }
        ])

        return res.status(200).json({
            msg: 'Average rating',
            status: 200,
            success: true,
            rating: avgRating[0].rating ?? 0
        })

    }
    catch (e) {
        if (e.errorInfo) {
            // User Not Found
            return returnUnAuthUserError(res, e.message)
        }
        return res.status(400).json({
            msg: 'Error fetching average rating',
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

async function rejectionSMS(
    id, phone
) {
    const worker = await workerModel.findById(id)

    if (!worker) return

    const body = {
        messages: [
            {
                text: `Document Rejection

Hi ${worker.name},

We regret to inform you that your document has been rejected. We appreciate your effort and interest in Easeup - WorkBuddy, but unfortunately, your document did not meet our requirements.

Please visit the Easeup - WorkBuddy app to submit the rejected document again.

Thank you for choosing Easeup - WorkBuddy. We are here to support you on your professional journey.

Best regards,
Easeup (WorkBuddy) Team`,
                type: 0,
                sender: process.env.EASEUP_SMS_SENDER,
                destinations: [
                    {
                        to: phone,
                    }
                ]
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

    await axios.post("https://api.smsonlinegh.com/v4/message/sms/send", body, headers)// wait for the sms to be sent
}

function updateVerificationStatus(workerProfile, field, employeeId, status) {
    workerProfile[`${field}_verified`] = status;
    workerProfile[`${field}_verified_by`] = status ? employeeId : "";
    workerProfile[`${field}_verified_date`] = Date.now();
    return workerProfile;

}


// Schedule the task to run every 15 minutes
cron.schedule('*/5 * * * *', async () => {

    try {
        const verifiedProfiles = await workerProfileVerificationModel.find({
            gh_card_verified: true,
            selfie_verified: true,
            // insurance_verified: true,
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

// set up a cron job to delete worker profiles that have not been verified after 30 days
// cron.schedule('0 0 * * *', async () => {
//     try {
//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         const unverifiedProfiles = await workerProfileVerificationModel.find({
//             createdAt: { $lte: thirtyDaysAgo },
//             gh_card_verified: false,
//             selfie_verified: false,
//             insurance_verified: false,
//             skill_verified: false,
//         });
//         console.log('Unverified Profiles:', unverifiedProfiles)

//         for (const worker of unverifiedProfiles) {
//             // delete worker profile
//             const workerProfile = await workerModel.findById(worker.worker)
//             if (!workerProfile) {
//                 continue
//             }
//             await workerProfile.deleteOne()
//         }
//     } catch (error) {
//         console.error('Error deleting unverified profiles: xw', error);
//     }
// })

module.exports.dashboard = router
