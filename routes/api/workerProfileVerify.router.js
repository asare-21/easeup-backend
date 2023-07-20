const router = require("express").Router();
const workerProfileVerifyController = require("../../controllers/workerProfileVerify.controller");
const { workerVerifyJWT} = require("../../passport/common");

router.get(
  "/:worker",
  workerVerifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/image",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerSelfie
);

router.post(
  "/update/ghc-images",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerGhc
);

router.post(
  "/update/age-verify",
  workerVerifyJWT,
  workerProfileVerifyController.workerAgeVerify
);

router.post(
  "/update/pos",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerPos
);

router.post(
  "/update/insurance",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerInsurance
);

router.post(
  "/update/address",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerAddress
);

router.post(
  "/update/gender",
  workerVerifyJWT,
  workerProfileVerifyController.updateworkerGender
);

router.post(
  "/phone/send-code",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerPhone
);

router.post(
  "/phone/verify-code",
  workerVerifyJWT,
  workerProfileVerifyController.updateWorkerPhoneVerifyCode
);

module.exports.workerProfileVerificationRoute = router;
