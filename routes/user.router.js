const router = require("express").Router();
const workerProfileVerifyController = require("../controllers/workerProfileVerify.controller");
const { verifyJWT } = require("../passport/common");

router.delete(
  "/:user",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.get(
  "/profile/:user_id",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/image",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/address",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/gender",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/token",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/phone",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update/ghc",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/update",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/phone/send-code",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/phone/verify-code",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/create",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.get(
  "/nofications/:user_id",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.post(
  "/nofications/update/:user_id",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.get(
  "/bookmarks",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

router.delete(
  "/bookmarks/delete",
  verifyJWT,
  workerProfileVerifyController.getWorkerProfileVerification
);

module.exports.userRoute = router;
