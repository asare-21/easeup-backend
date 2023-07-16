const router = require("express").Router();
const workerProfileController = require("../controllers/workerProfile.controller");
const { verifyJWT } = require("../passport/common");

router.get("/:worker", verifyJWT, workerProfileController.getWorkerProfile);

router.get(
  "/reviews/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/comments/:worker/:post",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post(
  "/comments/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post("/charge", verifyJWT, workerProfileController.getWorkerProfile);
router.post("/skills", verifyJWT, workerProfileController.getWorkerProfile);
router.post("/bio", verifyJWT, workerProfileController.getWorkerProfile);
router.post("/instagram", verifyJWT, workerProfileController.getWorkerProfile);
router.post("/portfolio", verifyJWT, workerProfileController.getWorkerProfile);
router.get(
  "/portfolio/:worker/:page",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post("/work-radius", verifyJWT, workerProfileController.getWorkerProfile);
router.get(
  "/booking/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get("/paid/:user", verifyJWT, workerProfileController.getWorkerProfile);
router.get(
  "/booking-upcoming/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking-pending/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking-progress/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking-completed/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking-cancelled/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.put(
  "/booking-status",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.put("/booking-status/pending", verifyJWT, workerProfileController.getWorkerProfile);
router.post(
  "/worker-review",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/worker-review/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post(
  "/available-slots/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post("/book-slot", verifyJWT, workerProfileController.getWorkerProfile);
router.post(
  "/verify-payment",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post("/refund/:ref", verifyJWT, workerProfileController.getWorkerProfile);
router.post("/cancel/:ref", verifyJWT, workerProfileController.getWorkerProfile);
router.patch(
  "/update-location",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.patch(
  "/update-date",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/notify/:worker",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get("/popular/:id", verifyJWT, workerProfileController.getWorkerProfile);

module.exports.workerProfileRoute = router;
