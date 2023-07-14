const router = require("express").Router();
const workerProfileVerifyController = require("../controllers/workerProfileVerify.controller");
const { verifyJWT } = require("../passport/common");

router.get(
  "/:worker",
  workerProfileVerifyController.getWorkerProfileVerification
);

module.exports.workerProfileVerificationRoute = router;
