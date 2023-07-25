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
  updateWorkerDetails = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileVerificationService.updateWorkerDetails(req, res);
    res.status(status).send(responseData);
  };

  updateWorkerPhone = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileVerificationService.updateWorkerPhone(req, res);
    res.status(status).send(responseData);
  };

  updateWorkerPhoneVerifyCode = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileVerificationService.updateWorkerPhoneVerifyCode(
        req,
        res
      );
    res.status(status).send(responseData);
  };
}

module.exports = new WorkerProfileVerifyController();
