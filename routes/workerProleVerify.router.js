const router = require("express").Router();
const workerProfileVerifyController = require("../controllers/workerProfileVerify.controller");
const { verifyJWT } = require("../passport/common");

router.get(
  "/:worker",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/image",
  verifyJWT,
  workerProfileVerifyController.updateWorkerSelfie
);

router.post(
  "/update/ghc-images",
  verifyJWT,
  workerProfileVerifyController.updateWorkerGhc
);

router.post(
  "/update/age-verify",
  verifyJWT,
  workerProfileVerifyController.workerAgeVerify
);

router.post(
  "/update/pos",
  verifyJWT,
  workerProfileVerifyController.updateWorkerPos
);

router.post(
  "/update/insurance",
  verifyJWT,
  workerProfileVerifyController.updateWorkerInsurance
);

router.post(
  "/update/address",
  verifyJWT,
  workerProfileVerifyController.updateWorkerAddress
);

router.post(
  "/update/gender",
  verifyJWT,
  workerProfileVerifyController.updateworkerGender
);

router.post(
  "/phone/send-code",
  verifyJWT,
  workerProfileVerifyController.updateWorkerPhone
);

router.post(
  "/phone/verify-code",
  verifyJWT,
  workerProfileVerifyController.updateWorkerPhoneVerifyCode
);

module.exports.workerProfileVerificationRoute = router;
