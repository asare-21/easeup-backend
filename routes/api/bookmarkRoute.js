const router = require('express').Router();
const admin = require("firebase-admin");
const log = require('npmlog');
const { bookmarkModel } = require('../../models/bookmark_model');
const { workerProfileModel } = require('../../models/worker_profile_model');
const { commonError, returnUnAuthUserError } = require('./user_route')
const pageLimit = 10;

router.get("/", async (req, res) => {
    const required_fields = ['uid', "page",]
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
    const { uid, page, } = req.body

    // check if user is authenticated
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        bookmarkModel.find({ user: uid }, (err, bookmarks) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Bookmarks',
                status: 200,
                success: true,
                bookmarks
            })

        }).limit(pageLimit).skip((page - 1) * pageLimit)

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

router.delete("/delete", async (req, res) => {
    const required_fields = ['uid', "bookmark_id"]
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
    const { uid, boookmark_id } = req.body
    // check if user is authenticated   
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        bookmarkModel.deleteOne({ _id: bookmark_id }, (err, bookmark) => {
            if (err) {
                return commonError(res, err.message)
            }
            return res.status(200).json({
                msg: 'Bookmark deleted',
                status: 200,
                success: true,
                bookmark
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

router.post("/add", async (req, res) => {

    const required_fields = ['uid', "worker_id"]
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

    const { uid, worker_id } = req.body
    try {
        await admin.auth().getUser(uid) // check if uid is valid
        workerProfileModel.findOne({ _id: worker_id }, (err, worker_profile) => {
            if (err) {
                return commonError(res, err.message)
            }
            if (!worker_profile) {
                return res.status(404).json({
                    msg: 'Worker not found',
                    status: 404,
                    success: false,
                })
            }
            const bookmark = new bookmarkModel({
                user: uid,
                worker_profile: worker_id
            })
            bookmark.save((err, bookmark) => {
                if (err) {
                    return commonError(res, err.message)
                }
                return res.status(200).json({
                    msg: 'Bookmark added',
                    status: 200,
                    success: true,
                    bookmark
                })
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

module.exports.bookmarkRoute = router;