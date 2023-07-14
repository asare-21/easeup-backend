const log = require("npmlog");
const { cache } = require("../cache/user_cache");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");

class WorkerProfileVerificationService {
  async findWorkerProfileVerification(req, res) {
    try {
      const { worker } = req.params;
      // check if worker is valid
      const retrievedWorker = await workerProfileVerificationModel.findOne({
        worker,
      });
      if (!retrievedWorker) {
        return { status: 404, msg: "worker not found", success: false };
      }

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        data: retrievedWorker,
      };
    } catch (e) {
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerSelfie(req, res) {
    try {
      const validationResults = await updateWorkerProfileImageValidator(
        req.body
      );

      if (validationResults.status !== 200) {
        return res.status(400).json({
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        });
      }

      const { worker, selfie } = req.body;

      // Update the worker
      const userExist = await workerProfileVerificationModel.findOneAndUpdate(
        { worker },
        {
          selfie,
        }
      );

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      const updateWorkerSelfie = await workerProfileModel.findOneAndUpdate(
        {
          worker,
        },
        {
          profile_url: selfie,
        }
      );
      cache.del(`worker-profile/${worker}`);
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updateWorkerSelfie,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerProfileVerificationService();
