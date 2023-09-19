const WorkerProfileService = require("../services/workerProfile.service");

class WorkerController {
  getWorkerProfile = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.findWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  getWorkerReviews = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.findWorkerReviews(req, res);
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
  addWorkerCharge = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerCharge(req, res);
    res.status(status).send(responseData);
  };
  addWorkerSkills = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerSkills(req, res);
    res.status(status).send(responseData);
  };

  addWorkerBio = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.addWorkerBio(
      req,
      res
    );
    res.status(status).send(responseData);
  };
  addWorkerInstagram = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkerInstagram(req, res);
    res.status(status).send(responseData);
  };

  addWorkerTwitter = async (req, res, next) => {
    const { status, ...responseData } =
      await WorkerProfileService.addWorkeTwitter(req, res);
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

  deletePost = async (req, res, next) => {
    const { status, ...responseData } = await WorkerProfileService.deletePost(
      req,
      res
    );
    res.status(status).send(responseData);
  }
}

module.exports = new WorkerController();
