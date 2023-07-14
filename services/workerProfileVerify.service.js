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
        return { status: 401, msg: "worker not found", success: false };
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
}

module.exports = new WorkerProfileVerificationService();
