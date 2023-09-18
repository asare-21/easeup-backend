const router = require("express").Router();
const workerController = require("../../controllers/worker.controller");
const { workerVerifyJWT } = require("../../passport/common");
const {
  getWorkerCache,
  getWorkerTokenCache,
} = require("../../cache/worker_cache");

router.get(
  "/:worker",
  workerVerifyJWT,
  getWorkerCache,
  workerController.getWorker
);

router.delete("/:worker", workerVerifyJWT, workerController.deleteWorker);

router.get(
  "/token/:worker",
  workerVerifyJWT,
  getWorkerTokenCache,
  workerController.getWorkerToken
);

router.post("/create", workerController.createWorker);

router.post("/login", workerController.loginWorker);

router.post("/location", workerVerifyJWT, workerController.saveLocation);

router.post("/update/token", workerVerifyJWT, workerController.updateToken);

router.get("/update/ghc", workerVerifyJWT, workerController.updateGhanaCard);

router.get(
  "/nofications/:user_id",
  workerVerifyJWT,
  workerController.getNotifications
);

router.post(
  "/nofications/update/:user_id",
  workerVerifyJWT,
  workerController.updateNotification
);

// password reset routes
router.post(
  "/request-password-reset",
  workerVerifyJWT,
  workerController.sendResetPasswordCode
);

router.post(
  "/verify-password-reset",
  workerVerifyJWT,
  workerController.resetPassword
);
// password reset routes outside app
router.post(
  "/request-password-reset-outside",
  workerController.sendResetPasswordCodeOutside
);

router.post(
  "/verify-password-reset-outside",
  workerController.resetPasswordOutside
);

module.exports.workerRoute = router;
