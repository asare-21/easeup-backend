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

module.exports.workerRoute = router;
