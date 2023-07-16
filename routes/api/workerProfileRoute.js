const router = require("express").Router();
const admin = require("firebase-admin");
const log = require("npmlog");
const { verifyJWT } = require("../../passport/common");
const {
  getWorkerProfileCache,
  getWorkerPortfolioCache,
} = require("../../cache/worker_profile");
const { bookmarkModel } = require("../../models/bookmark_model");
const { commentModel } = require("../../models/comments_model");
const { mediaModel } = require("../../models/mediaModel");
const { reviewModel } = require("../../models/reviews_model");
const { workerProfileModel } = require("../../models/worker_profile_model");
const { commonError, returnUnAuthUserError } = require("./user_route");
const { cache } = require("../../cache/user_cache");
const { bookingModel } = require("../../models/bookingModel");
const workerCache = cache;
const { isValidDate } = require("../../utils");
const crypto = require("crypto");
const { workerModel } = require("../../models/worker_models");
const { userModel } = require("../../models/user_model");
const secret = process.env.PAYSTACK_SECRET;
const https = require("https");
const { query } = require("express");
const { mediaCache } = require("../../cache/media_cache");
const {
  workerProfileVerificationModel,
} = require("../../models/worker_profile_verification_model");
const {
  findEarliestAvailableTimeSlot,
  getMissingField,
} = require("./booking_helper");
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
const { notificationModel } = require("../../models/nofications");
const {
  profileCommentsValidator,
  profileChargeValidator,
  profileSkillsUpdateValidator,
  profileBioUpdateValidator,
  profileIGUpdateValidator,
  profileTwitterUpdateValidator,
  profilePortfolioUpdateValidator,
  profileWorkRadiusUpdateValidator,
  profileReceieveWorkerReviewValidator,
  availableSlotsValidator,  
  bookSlotValidator,
  refundPaymentValidator,
  updateLocationValidator,
  updateDateValidator,
} = require("../../validators/workerProfile.validator");

router.get("/:worker", verifyJWT, getWorkerProfileCache, async (req, res) => {
  const { worker } = req.params;
  // check if user is authenticated
  try {
    // check if uid is valid
    const workerPromise = workerProfileModel.findOne({ worker });
    const rating = reviewModel
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
    const result = await Promise.all([workerPromise, rating]);
    const promiseWorker = result[0];
    const promiseRating = result[1];

    let avgRating = 0;

    if (promiseRating.length > 0) avgRating = promiseRating[0].avgRating ?? 0;

    const totalReviews = await reviewModel.countDocuments({ worker });

    promiseWorker.rating = avgRating;
    promiseWorker.totalReviews = totalReviews;
    promiseWorker.jobs = totalReviews;
    // console.log(foundWorker, avgRating, reviews)
    workerCache.set(`worker-profile/${worker}`, JSON.stringify(promiseWorker));

    return res.status(200).json({
      msg: "Worker Profile",
      status: 200,
      success: true,
      worker: promiseWorker,
      avgRating: avgRating ?? 0,
      totalReviews,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      console.log(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get("/reviews/:worker", verifyJWT, getReviewsCache, async (req, res) => {
  const { worker } = req.params;
  // check if user is authenticated
  try {
    // check if uid is valid
    const foundWorker = await reviewModel.find({ worker });

    if (foundWorker)
      workerCache.set(`reviews/${worker}`, JSON.stringify(foundWorker));

    return res.status(200).json({
      msg: "Worker Profile",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get(
  "/comments/:worker/:post",
  verifyJWT,
  getCommentsCache,
  async (req, res) => {
    const { worker, post } = req.params;
    // check if user is authenticated
    try {
      // check if uid is valid
      const posts = await commentModel.find({ post });
      // set cache
      workerCache.set(`comments/${post}`, JSON.stringify(posts));
      return res.status(200).json({
        msg: "Comments fetched",
        status: 200,
        success: true,
        posts,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);

router.post("/comments/:worker", verifyJWT, async (req, res) => {
  // check if user is authenticated
  try {
    const validationResults = await profileCommentsValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }

    const { worker } = req.params;
    const { comment, image, from, post, name } = req.body;

    // check if uid is valid
    const newComment = new commentModel({
      comment,
      image,
      from,
      post,
      name,
    });
    // get worker
    const workerData = await workerModel.findById(worker);
    // send notification to worker
    await admin.messaging().sendToDevice(workerData.token, {
      notification: {
        title: "New comment",
        body: `${name} commented on your post`,
      },
      data: {
        type: "comment",
        post,
      },
    });
    await newComment.save();
    return res.status(200).json({
      msg: "Comment Added",
      status: 200,
      success: true,
      comment,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/charge", verifyJWT, async (req, res) => {
  const { worker, charge } = req.body;
  try {
    const validationResults = await profileChargeValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    const foundWorker = await workerProfileModel.findOneAndUpdate(
      { worker },
      {
        base_price: charge,
      }
    );
    workerCache.del(`worker-profile/${worker}`);
    return res.status(200).json({
      msg: "Worker Profile Updated",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/skills", verifyJWT, async (req, res) => {
  try {
    const validationResults = await profileSkillsUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, skills } = req.body;
    // check if worker is valid
    const foundWorker = await workerProfileModel.findOneAndUpdate(
      { worker },
      {
        $set: {
          skills,
        },
      }
    );
    workerCache.del(`worker-profile/${worker}`);
    return res.status(200).json({
      msg: "Worker Profile Updated",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/bio", verifyJWT, async (req, res) => {
  const { worker, bio } = req.body;
  try {
    const validationResults = await profileBioUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    const foundWorker = await workerProfileModel.findOneAndUpdate(
      { worker },
      {
        $set: {
          bio,
        },
      }
    );
    workerCache.del(`worker-profile/${worker}`);
    return res.status(200).json({
      msg: "Worker Profile Updated",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/instagram", verifyJWT, async (req, res) => {
  const { worker, ig } = req.body;
  try {
    const validationResults = await profileIGUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    const foundWorker = await workerProfileModel.findOneAndUpdate(
      { worker },
      {
        $set: {
          "links.instagram": ig,
        },
      }
    );
    workerCache.del(`worker-profile/${worker}`);

    return res.status(200).json({
      msg: "Worker Profile Updated",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/twitter", verifyJWT, async (req, res) => {
  const { worker, twitter } = req.body;
  try {
    const validationResults = await profileTwitterUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    const foundWorker = await workerProfileModel.findOneAndUpdate(
      { worker },
      {
        $set: {
          "links.twitter": twitter,
        },
      }
    );
    workerCache.del(`worker-profile/${worker}`);

    return res.status(200).json({
      msg: "Worker Profile Updated",
      status: 200,
      success: true,
      worker: foundWorker,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/portfolio", verifyJWT, async (req, res) => {
  const { worker, media, description, thumbnail, image } = req.body;
  try {
    const validationResults = await profilePortfolioUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    const newMedia = new mediaModel({
      worker,
      url: media,
      description,
      image,
      thumbnail,
    });
    newMedia.save((err, worker) => {
      if (err) {
        console.log(err);
        return commonError(res, err.message);
      }
      return res.status(200).json({
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker,
      });
    });
  } catch (e) {
    console.log(e);
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get(
  "/portfolio/:worker/:page",
  verifyJWT,
  mediaCache,
  async (req, res) => {
    const { worker, page } = req.params;
    const pageSize = 10;
    try {
      // check if worker is valid
      const posts = await mediaModel
        .find({ worker })
        .limit(pageSize)
        .skip((page - 1) * pageSize); // get 5 posts per page
      if (!posts) return commonError(res, "No portfolio found");
      workerCache.set(`portfolio/${page}/${worker}`, JSON.stringify(posts));
      return res.status(200).json({
        msg: "Worker Profile Media Fetched Successfully",
        status: 200,
        success: true,
        worker: posts,
      });
    } catch (e) {
      console.log(e);
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);

router.post("/work-radius", verifyJWT, async (req, res) => {
  const { worker, radius } = req.body;
  try {
    const validationResults = await profileWorkRadiusUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    // check if worker is valid
    if (radius.radius > 50 || radius.radius < 5)
      return commonError(res, "Radius must be between 5 and 50");
    workerProfileModel.findOneAndUpdate(
      { worker },
      {
        work_radius: radius,
      },
      (err, worker) => {
        if (err) {
          return commonError(res, err.message);
        }

        return res.status(200).json({
          msg: "Worker Profile Updated",
          status: 200,
          success: true,
          worker,
        });
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get("/booking/:worker", verifyJWT, getBookingCache, async (req, res) => {
  const { worker } = req.params;
  try {
    // check if worker is valid
    const bookings = await bookingModel.find({ worker });
    // set cache
    workerCache.set(`booking/${worker}`, JSON.stringify(bookings));
    return res.status(200).json({
      msg: "Worker Profile Fetched Successfully",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get("/paid/:user", verifyJWT, getPaidBookingsCache, async (req, res) => {
  const { user } = req.params;
  try {
    const bookings = await bookingModel.find({ client: user, isPaid: true });
    // set cache
    workerCache.set(`paid-bookings/${user}`, JSON.stringify(bookings));
    return res.status(200).json({
      msg: "Worker Profile Fetched Successfully",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// upcoming
router.get(
  "/booking-upcoming/:worker",
  verifyJWT,
  getUpcomingBookingCache,
  async (req, res) => {
    const { worker } = req.params;
    const { user } = req.query;
    try {
      // check if worker is valid
      // console.log("User variable ", user)
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: worker,
        isPaid: true,
        cancelled: false,
        started: false,
      });
      console.log("Fetched bookings ", bookings);
      // set cahce
      workerCache.set(`upcoming-bookings/${worker}`, JSON.stringify(bookings));

      return res.status(200).json({
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);
// pending
router.get("/booking-pending/:worker", verifyJWT, async (req, res) => {
  const { worker } = req.params;
  const { user } = req.query;
  try {
    // check if worker is valid
    console.log("User variable ", Boolean("false"));
    const bookings = await bookingModel.find({
      [user === "true" ? "client" : "worker"]: worker,
      isPaid: true,
      cancelled: false,
      started: true,
      pending: true,
    });
    console.log("Fetched bookings ", bookings);
    // set cahce

    return res.status(200).json({
      msg: "Worker Profile Fetched Successfully",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// upcoming
router.get("/booking-progress/:worker", verifyJWT, async (req, res) => {
  const { worker } = req.params;
  const { user } = req.query;
  try {
    // check if worker is valid
    // console.log("User variable ", user)
    const bookings = await bookingModel.find({
      [user === "true" ? "client" : "worker"]: worker,
      isPaid: true,
      completed: false,
      started: true,
      pending: false,
    });
    console.log("Fetched bookings ", bookings);
    // set cahce

    return res.status(200).json({
      msg: "Worker Profile Fetched Successfully",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// completed
router.get(
  "/booking-completed/:worker",
  verifyJWT,
  getCompletedBookingCache,
  async (req, res) => {
    const { worker } = req.params;
    const { user } = req.query;
    try {
      // check if worker is valid
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: worker,
        isPaid: true,
        completed: true,
        started: true,
      });

      // set cache
      workerCache.set(`completed-bookings/${worker}`, JSON.stringify(bookings));
      return res.status(200).json({
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);

//cancelled
router.get(
  "/booking-cancelled/:worker",
  verifyJWT,
  getCancelledBookingCache,
  async (req, res) => {
    const { worker } = req.params;
    const { user } = req.query;
    console.log(query);
    try {
      // check if worker is valid
      // const bookings = await bookingModel.find({ [user == true || 'true' ? 'client' : 'worker']: worker, isPaid: true, completed: false, cancelled: true })
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: worker,
        isPaid: true,
        completed: false,
        cancelled: true,
      });
      // set cache
      workerCache.set(`cancelled-bookings/${worker}`, JSON.stringify(bookings));
      return res.status(200).json({
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);

// update booking status
router.put("/booking-status", verifyJWT, async (req, res) => {
  try {
    const validationResults = await profileWorkRadiusUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, client, ref } = req.body;
    const { started, completed } = req.query;
    if (!completed) {
      // check if any bookng has been started but not completed
      const bookingStarted = await bookingModel.findOne({
        worker,
        client,
        ref,
        started: true,
        completed: false,
      });
      if (bookingStarted)
        return commonError(
          res,
          "Sorry, you have a booking in progress. Please complete it before starting another booking."
        );
    }
    const booking = await bookingModel.findOneAndUpdate(
      {
        worker,
        client,
        ref,
      },
      {
        completed: completed ? completed : false,
        started: started ? started : false,
        pending: false,

        endTime: Date.now(),
      }
    );
    console.log(booking);
    if (!booking) return commonError(res, "Booking not found");
    workerCache.del(`in-progress-bookings/${worker}`);
    workerCache.del(`upcoming-bookings/${worker}`);

    return res.status(200).json({
      msg: "Booking Updated Successfully",
      status: 200,
      success: true,
      booking,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }

    return commonError(res, e.message);
  }
});

//mark as pending
router.put("/booking-status/pending", verifyJWT, async (req, res) => {
  try {
    const validationResults = await profileWorkRadiusUpdateValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, client, ref } = req.body;
    const bookingStarted = await bookingModel.findOne({
      worker,
      client,
      ref,
      started: true,
      completed: false,
    });
    if (!bookingStarted)
      return commonError(res, "Sorry, something went wrong.");

    // update
    bookingStarted.pending = true;
    bookingStarted.save();

    workerCache.del(`in-progress-bookings/${worker}`);
    workerCache.del(`upcoming-bookings/${worker}`);
    workerCache.del(`pending-bookings/${worker}`);

    // send notifcation to worker
    const workerfuture = await workerModel.findById(worker);
    if (worker) {
      // send notification to worker
      notificationModel;
      const notification = new notificationModel({
        user: worker,
        title: "Booking Pending",
        body: `Your booking with ${bookingStarted.clientName} has been marked as pending. Please contact the client to resolve the issue.`,
      });
      await notification.save();
      // send notification to client using Firebase Cloud Messaging

      await admin.messaging().send(workerfuture.token, {
        notification: {
          title: "Booking Pending",
          body: `Your booking with ${bookingStarted.clientName} has been marked as pending. Please contact the client to resolve the issue.`,
        },
      });
    }

    return res.status(200).json({
      msg: "Booking Updated Successfully",
      status: 200,
      success: true,
      // booking: bookingStarted,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }

    return commonError(res, e.message);
  }
});

// receive worker review
router.post("/worker-review", verifyJWT, async (req, res) => {
  try {
    const validationResults = await profileReceieveWorkerReviewValidator(
      req.body
    );

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, user, rating, review, userImage, name } = req.body;
    // check if worker is valid
    const reviewM = new reviewModel({
      worker,
      user,
      rating,
      review,
      name,
      userImage,
    });
    // save review
    await reviewM.save();
    return res.status(200).json({
      msg: "Reveiw saved",
      status: 200,
      success: true,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }

    return commonError(res, e.message);
  }
});
// get worker reviews
router.get(
  "/worker-review/:worker",
  verifyJWT,
  getWorkerReviewCache,
  async (req, res) => {
    try {
      const worker = req.params.worker;
      // check if worker is valid

      const reviewsPromise = await reviewModel
        .find({ worker })
        .limit(80)
        .sort({ date: -1 });
      const avgRatingPromise = await reviewModel
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
      const totalReviewsPromise = await reviewModel.countDocuments({ worker });
      const result = await Promise.all([
        reviewsPromise,
        avgRatingPromise,
        totalReviewsPromise,
      ]);
      const reviews = result[0];
      const avgRating = result[1];
      const totalReviews = result[2];

      reviews.avgRating = avgRating[0].avgRating ?? 0;
      reviews.total = totalReviews;

      // set cache
      workerCache.set(`worker-review/${worker}`, JSON.stringify(reviews));

      return res.status(200).json({
        msg: "Review saved",
        status: 200,
        success: true,
        reviews,
        avgRating: avgRating[0].avgRating ?? 0,
        total: totalReviews,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        log.warn(e.message);
        return returnUnAuthUserError(res, e.message);
      }

      return commonError(res, e.message);
    }
  }
);

router.post("/available-slots/:worker", verifyJWT, async (req, res) => {
  try {
    const validationResults = await availableSlotsValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { workers, day } = req.body;
    const currentDate = new Date(); // Get the current date
    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const selectedDay = new Date(day); // Get the selected day

    // Check if the selected day is in the past
    if (selectedDay < currentDay) {
      return res.status(200).json({
        msg: "No available slots",
        status: 200,
        success: true,
        timeslots: [],
      });
    }

    const currentTime = currentDate.getHours(); // Get the current hour

    const availableSlots = await Promise.all(
      workers.map(async (workerId) => {
        // Get the bookings for the worker on the specified day
        const slots = await bookingModel.find({
          worker: workerId,
          day,
          cancelled: false,
          completed: false,
          isPaid: true,
        });

        // Calculate available slots based on the booked slots and current time
        const availableHours = [8, 11, 14]; // Allowed hours: 8am, 11am, 2pm
        const availableSlots = availableHours.filter((hour) => {
          // Check if the worker has a booking at the hour and it's after the current time
          if (
            selectedDay.getMonth() === currentDay.getMonth() &&
            selectedDay.getDate() === currentDay.getDate()
          ) {
            // check current time
            // check if the day has bookings. if it does, check the slots used and return the available slots
            const usedHours = slots.map(
              (slot) => new Date(slot.date).getHours() - 1
            );
            console.log("Used hours", usedHours);
            return !usedHours.includes(hour) && hour > currentTime;
          } else {
            // check if the day has bookings. if it does, check the slots used and return the available slots
            const usedHours = slots.map(
              (slot) => new Date(slot.date).getHours() - 1
            );
            console.log("Used hours", usedHours);
            return !usedHours.includes(hour);
          }
        });
        return {
          workerId,
          slots: availableSlots,
          slotCount: availableSlots.length,
        };
      })
    );

    return res.status(200).json({
      msg: "Worker Profile Fetched Successfully",
      status: 200,
      success: true,
      timeslots: availableSlots,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.post("/book-slot", verifyJWT, async (req, res) => {
  try {
    // validate endpioint
    const validationResults = await bookSlotValidator(req.body);
    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const {
      worker,
      client,
      skills,
      name,
      fee,
      ref,
      latlng,
      image,
      workerImage,
      day,
      photos,
      clientName,
      basePrice,
    } = req.body;

    const start = await findEarliestAvailableTimeSlot(worker, day); // find earliest availble timeslor
    console.log("Generated start time ", start);
    if (!start) {
      return commonError(
        res,
        "No available time slots for the selected day. Please choose another day."
      );
    }

    const end = new Date(start).getTime() + 2 * 60 * 60 * 1000; // Calculate the end time (2 hours after the start time)
    // get client and worker phone numbers
    const clientPhone = await userModel.findById(client);

    const workerPhone = await workerProfileVerificationModel.findOne({
      worker,
    });
    const workerToken = await workerModel.findById(worker);
    // check if the phone numbers are available
    if (!clientPhone.phone || !workerPhone.phone) {
      return commonError(res, "Phone number not found.");
    }
    const newBooking = new bookingModel({
      worker,
      client,
      start,
      end,
      skills,
      name,
      clientName,
      ref,
      latlng,
      image,
      workerImage,
      commitmentFee: fee,
      day,
      date: start,
      photos,
      basePrice,
      clientPhone: clientPhone.phone,
      workerPhone: workerPhone.phone,
    });

    const result = await newBooking.save(); // save booking
    // clear cache
    workerCache.del(`booking/${worker}`);
    workerCache.del(`upcoming-bookings/${client}`);
    workerCache.del(`upcoming-bookings/${worker}`);

    // Send notifications to the worker and client
    if (workerPhone && clientPhone)
      await Promise.all([
        admin.messaging().sendToDevice(workerToken.token, {
          notification: {
            title: "New Booking",
            body: "You have a new booking. Please check your dashboard for more details.",
          },
          // token: workerToken.token
        }),
        admin.messaging().sendToDevice(clientPhone.token, {
          notification: {
            title: "New Booking",
            body: "Your booking was successful. Awaiting payment.",
          },
          // token: clientPhone.token
        }),
      ]);

    return res.status(200).json({
      msg: "Booking Successful",
      status: 200,
      success: true,
      result,
    });
  } catch (e) {
    console.log("booking error ", e);
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// webhook to verify payment
router.post("/verify-payment", verifyJWT, async (req, res) => {
  const { event, data } = req.body;
  try {
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash === req.headers["x-paystack-signature"]) {
      // Retrieve the request's body
      const success =
        data.gateway_response === "Approved" ||
        ("Successful" && event === "charge.success");
      const ref = data.reference;
      console.log(data);
      console.log(event);
      if (success) {
        const booking = await bookingModel.findOneAndUpdate(
          {
            ref,
          },
          {
            isPaid: true,
          }
        );
        console.log("Found booking ", booking);
        if (!booking) return commonError(res, "Booking not found");
        // send notification to device of worker and client
        const workerToken = await workerModel.findById(booking.worker);
        const userToken = await userModel.findById(booking.client);
        await admin.messaging().sendToDevice(userToken.token, {
          notification: {
            title: "Payment Verified",
            body: "Payment for your booking has been verified",
          },
        });
        const date = new Date(workerToken.date);
        const parseDate = date.toDateString();
        await admin.messaging().sendToDevice(workerToken.token, {
          notification: {
            title: "Booking Confirmed",
            body:
              workerToken.name +
              "has just booked you for " +
              parseDate +
              " Payment for your booking has been verified. Please check your dashboard for more details",
          },
        });
        return res.status(200).json({
          msg: "Payment Verified",
          status: 200,
        });
      }

      return res.status(200).json({
        msg: "Payment Not Verified",
        status: 200,
      });
    }
    return res.status(200).json({
      msg: "Payment Not Verified",
      status: 200,
    });
  } catch (e) {
    return commonError(res, e.message);
  }
}); 

router.post("/refund/:ref", verifyJWT, async (req, res) => {
  try {
    // refund payment and cancel booking.
    // Only refund 60% of the commitment fee
    const validationResults = await refundPaymentValidator(req.body);
    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, reason } = req.body;
    const options = {
      method: "POST",
      hostname: "api.paystack.co",
      path: "/refund",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
    };
    const { ref } = req.params;
    const foundBooking = await bookingModel.findOne({ ref }); // find booking
    // user and worker device tokens to send an alert that the refund has been process and booking cancelled
    const workerToken = await workerModel.findById(worker);
    const userToken = await userModel.findById(foundBooking.client);
    // Set refund details
    const refundDetails = JSON.stringify({
      transaction: foundBooking.ref,
      // 'amount': (foundBooking.commitmentFee * 100),
    });
    // send notification to device of worker and client
    await admin.messaging().sendToDevice(userToken.token, {
      notification: {
        title: "Refund Processed",
        body: "Your booking has been cancelled and refund processed",
      },
    });
    await admin.messaging().sendToDevice(workerToken.token, {
      notification: {
        title: "Sorry, Booking Cancelled",
        body: "The customer has cancelled the booking. Please check your dashboard for more details",
      },
    });
    const refundRequest = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", async () => {
        console.log(JSON.parse(data));
        await bookingModel.findOneAndUpdate(
          { ref, worker },
          {
            cancelled: true,
            cancelledReason: reason,
            endTime: Date.now(),
          }
        );
        workerCache.del(`in-progress-bookings/${worker}`);
        workerCache.del(`upcoming-bookings/${worker}`);
        workerCache.del(`cancelled-bookings/${worker}`);
        return res.status(200).json({
          msg: "Refund Processed",
          status: 200,
          success: true,
        });
      });
    });
    refundRequest.write(refundDetails);
    refundRequest.end();

    // find and delete bookng
  } catch (e) {
    console.log("Something went wrong ", e);
    return commonError(res, e.message);
  }
});

router.post("/cancel/:ref", verifyJWT, async (req, res) => {
  // refund payment and cancel booking.
  const { ref } = req.params;
  const { client } = req.body;
  const options = {
    method: "POST",
    hostname: "api.paystack.co",
    path: "/refund",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
  };
  try {
    const foundBooking = await bookingModel.findOne({ ref }); // find booking

    // user and worker device tokens to send an alert that the refund has been process and booking cancelled
    const workerToken = await workerModel.findById(foundBooking.worker);
    const userToken = await userModel.findById(client);
    // Set refund details
    const refundDetails = JSON.stringify({
      transaction: foundBooking.ref,
      amount: foundBooking.commitmentFee * 100 * 0.7,
    });
    await Promise.all([
      await admin.messaging().sendToDevice(userToken.token, {
        notification: {
          title: "Booking Cancelled.",
          body: "Your booking has been cancelled successfully. You will a 70% refund within 3-5 working days",
        },
      }),
      await admin.messaging().sendToDevice(workerToken.token, {
        notification: {
          title: "Sorry, Booking Cancelled",
          body: "The customer has cancelled the booking. Please check your dashboard for more details",
        },
      }),
    ]); // parallel async
    const refundRequest = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", async () => {
        console.log(JSON.parse(data));
        // update booking to cancelled
        await bookingModel.findOneAndUpdate(
          { ref },
          {
            cancelled: true,
            // cancelledReason: reason,
            endTime: Date.now(),
          }
        );
        return res.status(200).json({
          msg: "Refund Processed",
          status: 200,
          success: true,
        });
      });
    });
    refundRequest.write(refundDetails);
    refundRequest.end();
    // find and delete bookng
  } catch (e) {
    console.log("Something went wrong ", e);
    return commonError(res, e.message);
  }
});

router.patch("/update-location", verifyJWT, async (req, res) => {
  try {
    const validationResults = await updateLocationValidator(req.body);
    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, client, location, ref } = req.body;
    // check if worker is valid
    // check if worker is valid
    const bookings = await bookingModel
      .findOneAndUpdate(
        {
          worker,
          client,
          ref,
        },
        {
          latlng: location,
        },
        { new: true }
      )
      .exec();
    if (!bookings) return commonError(res, "Booking not found");

    console.log(bookings, typeof location[0], typeof location[1]);
    // send notification to device of worker and client
    const workerToken = await workerModel.findById(worker);
    const userToken = await userModel.findById(client);
    Promise.all([
      await admin.messaging().sendToDevice(userToken.token, {
        notification: {
          title: "Location update successfull",
          body: "Your location has been updated. We will notify the worker.",
        },
      }),
      await admin.messaging().sendToDevice(workerToken.token, {
        notification: {
          title: "Job location update.",
          body: "The client has updated their location. Please check your dashboard for more details",
        },
      }),
    ]);

    return res.status(200).json({
      msg: "Address Update Successfull",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.patch("/update-date", verifyJWT, async (req, res) => {
  try {
    const validationResults = await updateDateValidator(req.body);
    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg,
      });
    }
    const { worker, client, date, day, ref } = req.body;
    // check if worker is valid
    // check if worker is valid
    const bookings = await bookingModel.findOneAndUpdate(
      {
        worker,
        client,
        ref,
      },
      {
        date,
        day,
      },
      { new: true }
    );
    if (!bookings) return commonError(res, "Booking not found");

    console.log(bookings);
    // send notification to device of worker and client
    const workerToken = await workerModel.findById(worker);
    const userToken = await userModel.findById(client);
    Promise.all([
      await admin.messaging().sendToDevice(userToken.token, {
        notification: {
          title: "Date update successfull",
          body: "New date has been updated. We will notify the worker.",
        },
      }),
      await admin.messaging().sendToDevice(workerToken.token, {
        notification: {
          title: "Job date update.",
          body: "The client has updated the date and time for the job. Please check your dashboard for more details",
        },
      }),
    ]);

    return res.status(200).json({
      msg: "Update Successfull",
      status: 200,
      success: true,
      bookings,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get("/notify/:worker", verifyJWT, async (req, res) => {
  if (!req.params.worker) return commonError(res, "Worker ID not provided");
  try {
    const workerToken = await workerModel.findById(req.params.worker);
    admin.messaging().sendToDevice(workerToken.token, {
      notification: {
        title: "Booking request",
        body: "You have a new booking request. Please check your dashboard to accept/reject the booking.",
      },
      // token: workerToken.token
    });
    // set cache
    return res.status(200).json({
      msg: "Notification sent",
      status: 200,
      success: true,
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      console.log(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

router.get(
  "/popular/:id",
  verifyJWT,
  getPopularWorkersCache,
  async (req, res) => {
    const { id } = req.params;
    let profiles = [];

    try {
      const bookings = await bookingModel.find({
        status: "completed",
      });
      console.log(bookings);
      // Find the most popular services
      const serviceCounts = {};
      const workerCounts = {};

      bookings.forEach((booking) => {
        const service = booking.skills;
        const workerId = booking.worker;

        if (serviceCounts[service]) {
          serviceCounts[service]++;
          workerCounts[workerId]++;
        } else {
          serviceCounts[service] = 1;
          workerCounts[workerId] = 1;
        }
      });

      const popularServices = Object.keys(serviceCounts).sort((a, b) => {
        return serviceCounts[b] - serviceCounts[a];
      });

      // Find workers with the highest number of completed bookings
      const sortedWorkers = Object.keys(workerCounts).sort((a, b) => {
        return workerCounts[b] - workerCounts[a];
      });

      console.log("worker: ", sortedWorkers);

      // get the profiles of the sorted workers
      for (const foundWorker of sortedWorkers) {
        const foundProfile = await workerProfileModel.findOne({
          worker: foundWorker,
        });
        console.log("Found profile", foundProfile);

        if (foundProfile) {
          // get avg rating of worker
          console.log("Found Worker", foundWorker);
          const rating = await reviewModel
            .aggregate([
              {
                $match: { worker: foundWorker },
              },
              {
                $group: {
                  _id: null,
                  avgRating: { $avg: "$rating" },
                },
              },
            ])
            .exec();
          console.log("Rating", rating);
          if (rating.length > 0) {
            foundProfile.rating = rating[0].avgRating ?? 0;
          }
          profiles.push(foundProfile);
        }
      }
      // set cache
      workerCache.set(
        `popular-workers`,
        JSON.stringify({ profiles, popularServices, highest: sortedWorkers })
      );

      return res.json({
        popularServices,
        highest: sortedWorkers,
        profiles,
        success: true,
      });
    } catch (e) {
      if (e.errorInfo) {
        // User Not Found
        console.log(e.message);
        return returnUnAuthUserError(res, e.message);
      }
      return commonError(res, e.message);
    }
  }
);

module.exports.workerProfileRoute = router;
