const router = require("express").Router();
const workerController = require("../../controllers/worker.controller");
const { workerVerifyJWT } = require("../../passport/common");
const {
  getWorkerCache,
  getWorkerTokenCache,
} = require("../../cache/worker_cache");

router.post("/", workerController.createWorker);

router.get(
  "/:workerId",
  workerVerifyJWT,
  getWorkerCache,
  workerController.getWorker
);

router.delete("/:workerId", workerVerifyJWT, workerController.deleteWorker);

router.get(
  "/:workerId/token",
  workerVerifyJWT,
  getWorkerTokenCache,
  workerController.getWorkerToken
);

router.post("/login", workerController.loginWorker);

router.post(
  "/:workerId/location",
  workerVerifyJWT,
  workerController.saveLocation
);

router.patch("/:workerId/token", workerVerifyJWT, workerController.updateToken);

router.patch(
  "/:workerId/ghc",
  workerVerifyJWT,
  workerController.updateGhanaCard
);

router.get(
  "/:workerId/notifications",
  workerVerifyJWT,
  workerController.getNotifications
);

router.patch(
  "/:workerId/notifications",
  workerVerifyJWT,
  workerController.updateNotification
);

module.exports.workerRoute = router;
