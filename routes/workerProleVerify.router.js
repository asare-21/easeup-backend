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

module.exports.workerProfileVerificationRoute = router;
