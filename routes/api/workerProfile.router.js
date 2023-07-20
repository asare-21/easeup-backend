const router = require("express").Router();
const workerProfileController = require("../../controllers/workerProfile.controller");
const { workerVerifyJWT } = require("../../passport/common");
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
  workerVerifyJWT,
  getWorkerProfileCache,
  workerProfileController.getWorkerProfile
);

router.get(
  "/reviews/:worker",
  workerVerifyJWT,
  getReviewsCache,
  workerProfileController.getWorkerReviews
);
router.get(
  "/comments/:worker/:post",
  workerVerifyJWT,
  getCommentsCache,
  workerProfileController.getWorkerComments
);
router.post(
  "/comments/:worker",
  workerVerifyJWT,
  workerProfileController.addWorkerComments
);
router.post("/charge", workerVerifyJWT, workerProfileController.addWorkerCharge);
router.post("/skills", workerVerifyJWT, workerProfileController.addWorkerSkills);
router.post("/bio", workerVerifyJWT, workerProfileController.addWorkerBio);
router.post("/instagram", workerVerifyJWT, workerProfileController.addWorkerInstagram);
router.post("/portfolio", workerVerifyJWT, workerProfileController.addWorkerPortfolio);
router.get(
  "/portfolio/:worker/:page",
  workerVerifyJWT,
  mediaCache,
  workerProfileController.getWorkerPortfolio
);
router.post(
  "/work-radius",
  workerVerifyJWT,
  workerProfileController.addWorkerRadius
);
router.get(
  "/booking/:worker",
  workerVerifyJWT,
  getBookingCache,
  workerProfileController.getBooking
);
router.get(
  "/paid/:user",
  workerVerifyJWT,
  getPaidBookingsCache,
  workerProfileController.getPaidBooking
);
router.get(
  "/booking-upcoming/:worker",
  workerVerifyJWT,
  getUpcomingBookingCache,
  workerProfileController.getUpcomingBooking
);
router.get(
  "/booking-pending/:worker",
  workerVerifyJWT,
  workerProfileController.getPendingBooking
);
router.get(
  "/booking-progress/:worker",
  workerVerifyJWT,
  workerProfileController.getBookingInProgress
);
router.get(
  "/booking-completed/:worker",
  workerVerifyJWT,
  getCompletedBookingCache,
  workerProfileController.getCompletedBooking
);
router.get(
  "/booking-cancelled/:worker",
  workerVerifyJWT,
  getCancelledBookingCache,
  workerProfileController.getCancelledBooking
);
router.put(
  "/booking-status",
  workerVerifyJWT,
  workerProfileController.updateBookingStatus
);
router.put(
  "/booking-status/pending",
  workerVerifyJWT,
  workerProfileController.markBookingAsPending
);
router.post(
  "/worker-review",
  workerVerifyJWT,
  workerProfileController.addWorkerReviews
);
router.get(
  "/worker-review/:worker",
  workerVerifyJWT,
  getWorkerReviewCache,
  workerProfileController.getWorkerReviews
);
router.post(
  "/available-slots/:worker",
  workerVerifyJWT,
  workerProfileController.addAvailableSlots
);
router.post("/book-slot", workerVerifyJWT, workerProfileController.bookWorkerSlot);
router.post(
  "/verify-payment",
  workerVerifyJWT,
  workerProfileController.verifyPaymentWebhook
);
router.post(
  "/refund/:ref",
  workerVerifyJWT,
  workerProfileController.refundWorker
);
router.post(
  "/cancel/:ref",
  workerVerifyJWT,
  workerProfileController.cancelWorker
);
router.patch(
  "/update-location",
  workerVerifyJWT,
  workerProfileController.updateLocation
);
router.patch(
  "/update-date",
  workerVerifyJWT,
  workerProfileController.updateDate
);
router.get(
  "/notify/:worker",
  workerVerifyJWT,
  workerProfileController.notifyWorker
);
router.get(
  "/popular/:id",
  workerVerifyJWT,
  getPopularWorkersCache,
  workerProfileController.getPopular
);

module.exports.workerProfileRoute = router;
