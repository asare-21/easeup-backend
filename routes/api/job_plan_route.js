const router = require('express').Router();
const admin = require("firebase-admin");
const { jobModel } = require('../../models/jobModel');
const { jobPlanCache, singleJobPlanCache } = require('../../cache/job_plan_cache');
const { cache } = require('../../cache/user_cache');

router.get("/:client", jobPlanCache, async (req, res) => {
    // used to get job plans
    await admin.auth().getUser(req.params.client) // check if uid is valid
    const jobPlans = await jobModel.find({ client: req.params.client }).sort({ date: -1 })
    if (jobPlans.length === 0) {
        return res.status(404).json({
            msg: 'No job plans found',
            status: 404,
            success: false,
        })
    }
    // save to cache
    cache.set(`plans/${req.params.client}`, JSON.stringify(jobPlans))
    return res.status(200).json({
        msg: 'Job plans',
        status: 200,
        success: true,
        jobPlans
    })
})

router.get("/:client/:job_id", singleJobPlanCache, async (req, res) => {
    // get job plan by id
    await admin.auth().getUser(req.params.client) // check if uid is valid
    const jobPlan = await jobModel.findById(req.params.job_id)
    if (!jobPlan) {
        return res.status(404).json({
            msg: 'Job plan not found',
            status: 404,
            success: false,
        })
    }
    cache.set(`plans/${req.params.client}/${req.params.job_id}`, JSON.stringify(jobPlan))
    return res.status(200).json({
        msg: 'Job plan',
        status: 200,
        jobPlan,
        success: true,
    })
})

router.post("/:client", async (req, res) => {
    const { client, jobDescription, location, skills, photos } = req.body;
    await admin.auth().getUser(client) // check if uid is valid
    // check if a job plan with the same description exists

    const existingPlan = await jobModel.findOne({ jobDescription, skills })
    if (existingPlan) {
        return res.status(400).json({
            msg: 'Job plan already exists',
            status: 400,
            success: false,
        })
    }


    const jobPlan = new jobModel({
        client,
        jobDescription,
        location,
        skills,
        photos
    })

    await jobPlan.save()

    return res.status(200).json({
        success: true,
        status: 200,
        msg: 'Job plan created',
        jobPlan
    })

})

router.delete("/:client/:job_id", async (req, res) => {
    await admin.auth().getUser(req.params.client) // check if uid is valid
    const deleteJobPlan = await jobModel.findByIdAndDelete(req.params.job_id)

    if (!deleteJobPlan) {
        return res.status(404).json({
            msg: 'Job plan not found',
            status: 404,
            success: false,
        })
    }

    return res.status(200).json({
        msg: 'Job plan deleted',
        status: 200,
        success: true,
    })
})

router.put("/:client/:job_id", async (req, res) => {
    const { client, jobDescription, location, skills, photos } = req.body;
    await admin.auth().getUser(client) // check if uid is valid
    const updateJobPlan = await jobModel.findByIdAndUpdate(req.params.job_id, {
        jobDescription,
        location,
        skills,
    }, { new: true })

    if (!updateJobPlan) {
        return res.status(404).json({
            msg: 'Job plan not found',
            status: 404,
            success: false,
        })

    }

    return res.status(200).json({
        msg: 'Job plan updated',
        status: 200,
        success: true,
        updateJobPlan
    })
})


module.exports.jobPlanRoute = router;