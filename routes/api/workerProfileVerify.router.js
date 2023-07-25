const router = require("express").Router();
const workerProfileVerifyController = require("../../controllers/workerProfileVerify.controller");
const { workerVerifyJWT } = require("../../passport/common");

router.get(
  "/:workerId",
  workerVerifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.patch(
  "/:workerId",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerDetails
);

router.post(
  "/:workerId/phone/send-code",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerPhone
);

router.post(
  "/:workerId/phone/verify-code",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerPhoneVerifyCode
);

module.exports.workerProfileVerificationRoute = router;
