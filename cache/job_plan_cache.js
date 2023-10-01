const { redisClient } = require("./user_cache");




module.exports.jobPlanCache = async function jobPlanCache(req, res, next) {
    const jobPlans = await redisClient.get(`plans/${req.params.client}`); // get the worker portfolio from cache based on page
    if (jobPlans !== null && jobPlans !== undefined) {
        return res.status(200).json({
            msg: 'job plans found', status: 200, success: true, jobPlans: JSON.parse(jobPlans)
        })
    }

    next();
}
module.exports.singleJobPlanCache = async function singleJobPlanCache(req, res, next) {
    const jobPlan = await redisClient.get(`plans/${req.params.client}/${req.params.job_id}`); // get the worker portfolio from cache based on page

    if (jobPlans !== null && jobPlans !== undefined) {
        return res.status(200).json({
            msg: 'job plans found', status: 200, success: true, jobPlan: JSON.parse(jobPlan)
        })
    }

    next();
}
