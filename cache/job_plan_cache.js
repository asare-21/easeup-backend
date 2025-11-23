const { redisClient } = require("./user_cache");

module.exports.jobPlanCache = async function jobPlanCache(req, res, next) {
    try {
        const jobPlans = await redisClient.get(`plans/${req.params.client}`);
        if (jobPlans !== null && jobPlans !== undefined) {
            return res.status(200).json({
                msg: 'job plans found', status: 200, success: true, jobPlans: JSON.parse(jobPlans)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

module.exports.singleJobPlanCache = async function singleJobPlanCache(req, res, next) {
    try {
        const jobPlan = await redisClient.get(`plans/${req.params.client}/${req.params.job_id}`);

        if (jobPlan !== null && jobPlan !== undefined) {
            return res.status(200).json({
                msg: 'job plan found', status: 200, success: true, jobPlan: JSON.parse(jobPlan)
            })
        }
        next();
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}
