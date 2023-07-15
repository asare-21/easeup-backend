const router = require("express").Router();
const workerController = require("../controllers/worker.controller");
const { verifyJWT } = require("../passport/common");
const {
  getWorkerCache,
  getWorkerTokenCache,
} = require("../cache/worker_cache");

router.get("/:worker", verifyJWT, getWorkerCache, workerController.getWorker);

router.delete("/:worker", verifyJWT, workerController.deleteWorker);

router.get(
  "/token/:worker",
  verifyJWT,
  getWorkerTokenCache,
  workerController.getWorkerToken
);

router.post("/create", verifyJWT, workerController.createWorker);

router.post("/location", verifyJWT, workerController.saveLocation);

router.post("/update/token", verifyJWT, workerController.updateToken);

router.get("/update/ghc", verifyJWT, workerController.updateGhanaCard);

router.get(
  "/nofications/:user_id",
  verifyJWT,
  workerController.getNotifications
);

router.post(
  "/nofications/update/:user_id",
  verifyJWT,
  workerController.updateNotification
);

module.exports.workerRoute = router;
