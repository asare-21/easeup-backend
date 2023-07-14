const WorkerProfileVerificationService = require("../services/workerProfileVerify.service");

class WorkerProfileVerifyController {
  getWorkerProfileVerification = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileVerificationService.findWorkerProfileVerification(
        req,
        res
      );
    res.status(status).send(responseData);
  };
}

module.exports = new WorkerProfileVerifyController();
