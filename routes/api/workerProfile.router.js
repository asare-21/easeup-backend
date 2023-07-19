const router = require("express").Router();
const workerProfileController = require("../../controllers/workerProfile.controller");
const { verifyJWT } = require("../../passport/common");
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
} = require("../../cache/worker_cache");
const { mediaCache } = require("../../cache/media_cache");
const { getWorkerProfileCache } = require("../../cache/worker_profile");

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
  workerProfileController.getWorkerReviews
);
router.get(
  "/comments/:worker/:post",
  verifyJWT,
  getCommentsCache,
  workerProfileController.getWorkerComments
);
router.post(
  "/comments/:worker",
  verifyJWT,
  workerProfileController.addWorkerComments
);
router.post("/charge", verifyJWT, workerProfileController.addWorkerCharge);
router.post("/skills", verifyJWT, workerProfileController.addWorkerSkills);
router.post("/bio", verifyJWT, workerProfileController.addWorkerBio);
router.post("/instagram", verifyJWT, workerProfileController.addWorkerInstagram);
router.post("/portfolio", verifyJWT, workerProfileController.addWorkerPortfolio);
router.get(
  "/portfolio/:worker/:page",
  verifyJWT,
  mediaCache,
  workerProfileController.getWorkerPortfolio
);
router.post(
  "/work-radius",
  verifyJWT,
  workerProfileController.addWorkerRadius
);
router.get(
  "/booking/:worker",
  verifyJWT,
  getBookingCache,
  workerProfileController.getBooking
);
router.get(
  "/paid/:user",
  verifyJWT,
  getPaidBookingsCache,
  workerProfileController.getPaidBooking
);
router.get(
  "/booking-upcoming/:worker",
  verifyJWT,
  getUpcomingBookingCache,
  workerProfileController.getUpcomingBooking
);
router.get(
  "/booking-pending/:worker",
  verifyJWT,
  workerProfileController.getPendingBooking
);
router.get(
  "/booking-progress/:worker",
  verifyJWT,
  workerProfileController.getBookingInProgress
);
router.get(
  "/booking-completed/:worker",
  verifyJWT,
  getCompletedBookingCache,
  workerProfileController.getCompletedBooking
);
router.get(
  "/booking-cancelled/:worker",
  verifyJWT,
  getCancelledBookingCache,
  workerProfileController.getCancelledBooking
);
router.put(
  "/booking-status",
  verifyJWT,
  workerProfileController.updateBookingStatus
);
router.put(
  "/booking-status/pending",
  verifyJWT,
  workerProfileController.markBookingAsPending
);
router.post(
  "/worker-review",
  verifyJWT,
  workerProfileController.addWorkerReviews
);
router.get(
  "/worker-review/:worker",
  verifyJWT,
  getWorkerReviewCache,
  workerProfileController.getWorkerReviews
);
router.post(
  "/available-slots/:worker",
  verifyJWT,
  workerProfileController.addAvailableSlots
);
router.post("/book-slot", verifyJWT, workerProfileController.bookWorkerSlot);
router.post(
  "/verify-payment",
  verifyJWT,
  workerProfileController.verifyPaymentWebhook
);
router.post(
  "/refund/:ref",
  verifyJWT,
  workerProfileController.refundWorker
);
router.post(
  "/cancel/:ref",
  verifyJWT,
  workerProfileController.cancelWorker
);
router.patch(
  "/update-location",
  verifyJWT,
  workerProfileController.updateLocation
);
router.patch(
  "/update-date",
  verifyJWT,
  workerProfileController.updateDate
);
router.get(
  "/notify/:worker",
  verifyJWT,
  workerProfileController.notifyWorker
);
router.get(
  "/popular/:id",
  verifyJWT,
  getPopularWorkersCache,
  workerProfileController.getPopular
);

module.exports.workerProfileRoute = router;
