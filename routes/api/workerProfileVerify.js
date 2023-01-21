const router = require('express').Router();
const { workerProfileVerificationModel } = require('../../models/worker_profile_verification_model');
const { notificationModel } = require('../../models/nofications');
const admin = require("firebase-admin");
const log = require('npmlog')
const otpGenerator = require('otp-generator')
const axios = require('axios')
const { commonError, returnUnAuthUserError } = require('../api/user_route')

// worker profile verification data
router.get('/:worker', async (req, res) => {
    const { worker } = req.params

    // check if user is authenticated
    try {
        await admin.auth().getUser(worker) // check if worker is valid
        workerProfileVerificationModel.findById(worker, (err, worker) => {
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

// update selfie
router.post('/update/image', (req, res) => {
    try {  // required field : user_id
        const { worker, selfie } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!selfie) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate
            (worker, {
                selfie
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
//accepts url of front and back of ghana card
// update ghc front
// update ghc back
router.post('/update/ghc-images', (req, res) => {
    try {  // required field : user_id
        const { worker, ghc_back, ghc_front } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!ghc_back && !ghc_front) return res.status(400).json({ msg: 'Bad Request. Missing fields. ghc_back and ghc_front are required', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate
            (worker, {
                ghc_back,
                ghc_front
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

// update age doc
router.post('/update/age-verify', (req, res) => {
    try {  // required field : user_id
        const { worker, age_doc } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!age_doc) return res.status(400).json({ msg: 'Bad Request. Missing fields. ghc_back and ghc_front are required', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate
            (worker, {
                age_doc
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

// update proof of skill
router.post('/update/pos', (req, res) => {
    try {  // required field : user_id
        const { worker, proof_skill } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!proof_skill) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate

            (worker, {
                proof_skill
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

// insurance
router.post('/update/insurance', (req, res) => {
    try {  // required field : user_id
        const { worker, insurance_doc } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!insurance_doc) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate
            (worker, {
                insurance_doc
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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
// update address
router.post('/update/address', (req, res) => {
    try {  // required field : user_id
        const { worker, address, latlng } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!address) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate

            (worker, {
                address: {
                    address,
                    latlng
                }
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

// update gender
router.post('/update/gender', (req, res) => {
    try {  // required field : worker
        const { worker, gender } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        admin.auth().getUser(worker)
        // check for required fields
        if (!gender) return res.status(400).json({ msg: 'Bad Request. Missing fields', status: 400, success: false }) // At least one field is required
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate

            (worker, {
                gender
            }, (err, user) => {
                if (err) {
                    log.warn(err.message)
                    return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
                }
                if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
                return res.status(200).json({
                    msg: 'Profile updated', status: 200, success: true, user
                }) // User Found and returned
            }
            )
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

// send verifcatioin code
router.post('/phone/send-code', async (req, res) => {
    // 
    try {  // required field : user_id
        const { worker, phone } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(worker)
        // check for required fields
        if (!phone) return res.status(400).json({ msg: 'Bad Request. Missing fields. phone field is required', status: 400, success: false }) // At least one field is required
        // check if the phone number is equal to the one in the database
        const user = await workerProfileVerificationModel.findById(worker)
        if (user.phone.toString() === phone.toString()) return res.status(400).json({ msg: 'Sorry. Operation not allowed', status: 400, success: false }) // At least one field is required

        // Generate OTP and send SMS
        const code = otpGenerator.generate(6, {
            digits: true,
            alphabets: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        })
        // Send SMS
        const message = `Your Easeup verification code is ${code}`

        const response = await axios.get(`https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`)// wait for the sms to be sent
        console.log(response)
        if (response.data.handshake.label !== "HSHK_OK") return res.json({ msg: 'Handshake error. Access Denied', status: 500, success: false }) // Internal Server Error
        // Find the user
        workerProfileVerificationModel.findByIdAndUpdate(worker, {
            code: code
        }, async (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Update the user
            return res.status(200).json({ msg: `Verification code has been sent to ${phone}`, status: 200, success: true }) // User Updated
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

// update phone
router.post('/phone/verify-code', async (req, res) => {
    // 
    try {  // required field : user_id
        const { worker, phone, code } = req.body;
        if (!worker) return res.status(400).json({ msg: 'Bad Request', status: 400, success: false }) // User ID is required
        //check firebase if uid exists
        await admin.auth().getUser(worker)
        // check for required fields
        if (!phone && !code) return res.status(400).json({ msg: 'Bad Request. Missing fields. phone and code fields are required', status: 400, success: false }) // At least one field is required

        // Find the user
        workerProfileVerificationModel.findById(worker, async (err, user) => {
            if (err) return res.status(500).json({ msg: 'Internal Server Error', status: 500, success: false }) // Internal Server Error
            if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
            // Check if code matches
            if (user.code.toString() !== code.toString()) return res.status(400).json({ msg: 'Verification code is incorrect', status: 400, success: false }) // Verification code is incorrect
            // Update the user if code matched
            await workerProfileVerificationModel.findByIdAndUpdate(worker, { code: "", phone },)
            return res.status(200).json({ msg: `Code has been verified successfully.`, status: 200, success: true }) // User Updated
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






module.exports.workerProfileVerificationRoute = router
