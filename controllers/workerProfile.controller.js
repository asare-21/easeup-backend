const WorkerProfileService = require("../services/workerProfile.service");

class WorkerController {
  getWorkerProfile = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.findWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  getWorkerReview = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findWorkerReview(req, res);
    res.status(status).send(responseData);
  };
  getWorkerComments = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findWorkerComments(req, res);
    res.status(status).send(responseData);
  };
  addWorkerComments = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerComments(req, res);
    res.status(status).send(responseData);
  };
  updateWorkerProfileDetails= async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.updateWorkerProfileDetails(req, res);
    res.status(status).send(responseData);
  };
  addWorkerPortfolio = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerPortfolio(req, res);
    res.status(status).send(responseData);
  };
  getWorkerPortfolio = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.getWorkerPortfolioPage(req, res);
    res.status(status).send(responseData);
  };

  addWorkerRadius = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerRadius(req, res);
    res.status(status).send(responseData);
  };
  getBooking = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.findBooking(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  getPaidBooking = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findPaidBooking(req, res);
    res.status(status).send(responseData);
  };
  getUpcomingBooking = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findUpcomingBooking(req, res);
    res.status(status).send(responseData);
  };
  getPendingBooking = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findPendingBooking(req, res);
    res.status(status).send(responseData);
  };

  getBookingInProgress = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findBookingInProgress(req, res);
    res.status(status).send(responseData);
  };
  getCompletedBooking = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findCompletedBooking(req, res);
    res.status(status).send(responseData);
  };

  getCancelledBooking = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findCancelledBooking(req, res);
    res.status(status).send(responseData);
  };
  updateBookingStatus = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.updateBookingStatus(req, res);
    res.status(status).send(responseData);
  };
  markBookingAsPending = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.markBookingAsPending(req, res);
    res.status(status).send(responseData);
  };
  addWorkerReviews = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerReviews(req, res);
    res.status(status).send(responseData);
  };
  getWorkerReviews = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findWorkerReviews(req, res);
    res.status(status).send(responseData);
  };
  addAvailableSlots = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addAvailableSlots(req, res);
    res.status(status).send(responseData);
  };
  bookWorkerSlot = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.bookWorkerSlot(req, res);
    res.status(status).send(responseData);
  };

  verifyPaymentWebhook = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.verifyPaymentWebhook(req, res);
    res.status(status).send(responseData);
  };

  refundWorker = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.refundWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  cancelWorker = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.cancelWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  updateLocation = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.updateLocation(req, res);
    res.status(status).send(responseData);
  };
  updateDate = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.updateDate(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  notifyWorker = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.notifyWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  getPopular = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.getPopular(
      req,
      res
    );
    res.status(status).send(responseData);
  };
}

module.exports = new WorkerController();
