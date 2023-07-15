const router = require("express").Router();
const workerProfileController = require("../controllers/workerProfile.controller");
const { verifyJWT } = require("../passport/common");

router.get(
  "/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);


module.exports.workerProfileRoute = router;
