const router = require("express").Router();
const workerProfileController = require("../controllers/workerProfile.controller");
const { verifyJWT } = require("../passport/common");
const {
  getReviewsCache,
  getCommentsCache,
  getBookingCache,
  getUpcomingBookingCache,
  getInProgressBookingCache,
  getCompletedBookingCache,
  getCancelledBookingCache,
  getWorkerReviewCache,
  getPopularWorkersCache,
  getNotificationsCache,
  getPaidBookingsCache,
  getPendingBookingCache,
} = require("../cache/worker_cache");
const { mediaCache } = require("../cache/media_cache");
const { getWorkerProfileCache } = require("../cache/worker_profile");

router.get(
  "/:worker",
  verifyJWT,
  getWorkerProfileCache,
  workerProfileController.getWorkerProfile
);

router.get(
  "/reviews/:worker",
  verifyJWT,
  getReviewsCache,
  workerProfileController.getWorkerProfile
);
router.get(
  "/comments/:worker/:post",
  verifyJWT,
  getCommentsCache,
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
  mediaCache,
  workerProfileController.getWorkerProfile
);
router.post(
  "/work-radius",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking/:worker",
  verifyJWT,
  getBookingCache,
  workerProfileController.getWorkerProfile
);
router.get("/paid/:user", verifyJWT,getPaidBookingsCache, workerProfileController.getWorkerProfile);
router.get(
  "/booking-upcoming/:worker",
  verifyJWT,
  getUpcomingBookingCache,
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
  getCompletedBookingCache,
  workerProfileController.getWorkerProfile
);
router.get(
  "/booking-cancelled/:worker",
  verifyJWT,
  getCancelledBookingCache,
  workerProfileController.getWorkerProfile
);
router.put(
  "/booking-status",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.put(
  "/booking-status/pending",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post(
  "/worker-review",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.get(
  "/worker-review/:worker",
  verifyJWT,
  getWorkerReviewCache,
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
router.post(
  "/refund/:ref",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
router.post(
  "/cancel/:ref",
  verifyJWT,
  workerProfileController.getWorkerProfile
);
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
router.get("/popular/:id", verifyJWT, getPopularWorkersCache,workerProfileController.getWorkerProfile);

module.exports.workerProfileRouteNew = router;
