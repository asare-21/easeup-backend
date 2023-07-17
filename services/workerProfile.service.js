const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
class WorkerProfileService {
  // get worker
  async findWorker(req, res) {
    try {
      //TODO ADD SERVICE
      const rating = await reviewModel
        .aggregate([
          {
            $match: { worker },
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
            },
          },
        ])
        .exec();


      let avgRating = 0;

      if (promiseRating.length > 0) avgRating = promiseRating[0].avgRating ?? 0;

      const totalReviews = await reviewModel.countDocuments({ worker });

      result.rating = avgRating;
      result.totalReviews = totalReviews;
      result.jobs = totalReviews;
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findWorkerReviews(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findWorkerComments(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerComments(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerCharge(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerSkills(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerBio(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerInstagram(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkeTwitter(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addWorkerPortfolio(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async addWorkerRadius(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async findBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findPaidBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findUpcomingBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findPendingBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findBookingInProgress(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findCompletedBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findCancelledBooking(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async updateBookingStatus(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async markBookingAsPending(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async addWorkerReviews(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findWorkerReviews(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async addAvailableSlots(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async bookWorkerSlot(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async verifyPaymentWebhook(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async refundWorker(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async cancelWorker(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async updateLocation(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async updateDate(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async notifyWorker(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async getPopular(req, res) {
    try {
      //TODO ADD SERVICE
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerProfileService();
