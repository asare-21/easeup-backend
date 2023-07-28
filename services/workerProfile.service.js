const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { bookmarkModel } = require("../models/bookmark_model");
const { commentModel } = require("../models/comments_model");
const { mediaModel } = require("../models/mediaModel");
const { reviewModel } = require("../models/reviews_model");
const { workerProfileModel } = require("../models/worker_profile_model");
const { cache } = require("../cache/user_cache");
const workerCache = cache;
const { bookingModel } = require("../models/bookingModel");
const { commonError, returnUnAuthUserError } = require("../utils");
const { isValidDate } = require("../utils");
const { userModel } = require("../models/user_model");
const secret = process.env.PAYSTACK_SECRET;
const https = require("https");
const { query } = require("express");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");
const {
  findEarliestAvailableTimeSlot,
  getMissingField,
} = require("../routes/api/booking_helper");
const { notificationModel } = require("../models/nofications");
const {
  profileCommentsValidator,
  updateWorkerProfileDetails,
  profilePortfolioUpdateValidator,
  profileWorkRadiusUpdateValidator,
  profileReceieveWorkerReviewValidator,
  availableSlotsValidator,
  bookSlotValidator,
  refundPaymentValidator,
  updateLocationValidator,
  updateDateValidator,
  profileBookingStatusUpdateValidator,
} = require("../validators/workerProfile.validator");
const {
  updateBookingStatus,
} = require("../controllers/workerProfile.controller");
class WorkerProfileService {
  // get worker
  async findWorker(req, res) {
    try {
      const workerId = req.user.id;
      // check if uid is valid
      const workerPromise = workerProfileModel.findOne({ worker: workerId });
      const rating = reviewModel
        .aggregate([
          {
            $match: { worker: workerId },
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
      let response = await Promise.all([
        workerPromise,
        rating,
        reviewModel.countDocuments({ worker: workerId }),
      ]);

      if (response[1].length > 0) avgRating = response[1].avgRating ?? 0;

      const totalReviews = response[2];

      response[0].rating = avgRating;
      response[0].totalReviews = totalReviews;
      response[0].jobs = totalReviews;
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        worker: response[0] ?? {},
        avgRating: avgRating ?? 0,
        totalReviews,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker reviews
  async findWorkerReview(req, res) {
    try {
      const workerId = req.user.id;
      // check if uid is valid
      const foundWorker = await reviewModel.find({ worker: workerId });

      if (foundWorker)
        workerCache.set(`reviews/${workerId}`, JSON.stringify(foundWorker));

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker comments
  async findWorkerComments(req, res) {
    try {
      const { postId } = req.params;
      // check if uid is valid
      const posts = await commentModel.find({ post: postId });
      // set cache
      workerCache.set(`comments/${postId}`, JSON.stringify(posts));
      return {
        msg: "Comments fetched",
        status: 200,
        success: true,
        posts,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerProfileDetails(req, res) {
    try {
      const workerId = req.user.id;
      const validationResults = await updateWorkerProfileDetails(req.body);
      const { charge, skills, bio, ig, twitter } = req.body;
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      // check if worker is valid
      const foundWorker = await workerProfileModel.findOneAndUpdate(
        { worker: workerId },
        {
          $set: {
            base_price: charge,
            skills,
            bio,
            "links.instagram": ig,
            "links.twitter": twitter,
          },
        }
      );
      workerCache.del(`worker-profile/${workerId}`);
      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // post worker comments
  async addWorkerComments(req, res) {
    try {
      const validationResults = await profileCommentsValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      const workerId = req.user.id;
      const { comment, image, from, postId, name } = req.body;

      // check if uid is valid
      const newComment = new commentModel({
        comment,
        image,
        from,
        post: postId,
        name,
      });
      // get worker
      const workerData = await workerModel.findById(workerId);
      // // send notification to worker
      // await admin.messaging().sendToDevice(workerData.token, {
      //   notification: {
      //     title: "New comment",
      //     body: `${name} commented on your post`,
      //   },
      //   data: {
      //     type: "comment",
      //     post:postId,
      //   },
      // });
      await newComment.save();
      return {
        msg: "Comment Added",
        status: 200,
        success: true,
        comment,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // add worker portfolio
  async addWorkerPortfolio(req, res) {
    try {
      const { media, description, thumbnail, image } = req.body;
      const validationResults = await profilePortfolioUpdateValidator(req.body);
      const workerId = req.user.id;

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      // check if worker is valid
      const newMedia = new mediaModel({
        worker: workerId,
        url: media,
        description,
        image,
        thumbnail,
      });
      const updatedWorker = await newMedia.save();
      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        updatedWorker,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get worker portfolio
  async getWorkerPortfolioPage(req, res) {
    try {
      const { page } = req.params;
      const workerId = req.user.id;
      const pageSize = 10;
      // check if worker is valid
      const posts = await mediaModel
        .find({ worker: workerId })
        .limit(pageSize)
        .skip((page - 1) * pageSize); // get 5 posts per page
      if (!posts) return commonError(res, "No portfolio found");
      workerCache.set(`portfolio/${page}/${workerId}`, JSON.stringify(posts));
      return {
        msg: "Worker Profile Media Fetched Successfully",
        status: 200,
        success: true,
        worker: posts,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async addWorkerRadius(req, res) {
    try {
      const validationResults = await profileWorkRadiusUpdateValidator(
        req.body
      );
      const { radius } = req.body;
      const workerId = req.user.id;

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      // check if worker is valid
      if (radius.radius > 50 || radius.radius < 5)
        return commonError(res, "Radius must be between 5 and 50");
      const updatedWorker = await workerProfileModel.findOneAndUpdate(
        { worker: workerId },
        {
          work_radius: radius,
        }
      );

      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        updatedWorker,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  //get worker booking
  async findBooking(req, res) {
    try {
      const workerId = req.user.id;
      // check if worker is valid
      const bookings = await bookingModel.find({ worker: workerId });
      // set cache
      workerCache.set(`booking/${workerId}`, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get paid booking
  async findPaidBooking(req, res) {
    try {
      const { user } = req.params;
      const bookings = await bookingModel.find({ client: user, isPaid: true });
      // set cache
      workerCache.set(`paid-bookings/${user}`, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get upcoming booking
  async findUpcomingBooking(req, res) {
    try {
      const workerId = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      // console.log("User variable ", user)
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: workerId,
        isPaid: true,
        cancelled: false,
        started: false,
      });
      console.log("Fetched bookings ", bookings);
      // set cahce
      workerCache.set(
        `upcoming-bookings/${workerId}`,
        JSON.stringify(bookings)
      );

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get pending booking
  async findPendingBooking(req, res) {
    try {
      const { worker } = req.params;
      const { user } = req.query;
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

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get upcommming
  async findBookingInProgress(req, res) {
    try {
      const { worker } = req.params;
      const { user } = req.query;
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

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get completed booking
  async findCompletedBooking(req, res) {
    try {
      const workerId = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: workerId,
        isPaid: true,
        completed: true,
        started: true,
      });

      // set cache
      workerCache.set(
        `completed-bookings/${workerId}`,
        JSON.stringify(bookings)
      );
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
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
      const workerId = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      // const bookings = await bookingModel.find({ [user == true || 'true' ? 'client' : 'worker']: worker, isPaid: true, completed: false, cancelled: true })
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: workerId,
        isPaid: true,
        completed: false,
        cancelled: true,
      });
      // set cache
      workerCache.set(
        `cancelled-bookings/${workerId}`,
        JSON.stringify(bookings)
      );
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // update booking status
  async updateBookingStatus(req, res) {
    try {
      const validationResults = await profileBookingStatusUpdateValidator(
        req.body
      );

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { client, ref } = req.body;
      const { started, completed } = req.query;
      const workerId = req.user.id;
      if (!completed) {
        // check if any bookng has been started but not completed
        const bookingStarted = await bookingModel.findOne({
          worker: workerId,
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
          worker: workerId,
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
      workerCache.del(`in-progress-bookings/${workerId}`);
      workerCache.del(`upcoming-bookings/${workerId}`);

      return {
        msg: "Booking Updated Successfully",
        status: 200,
        success: true,
        booking,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // mark booking as pending
  async markBookingAsPending(req, res) {
    try {
      const validationResults = await profileBookingStatusUpdateValidator(
        req.body
      );

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { client, ref } = req.body;
      const workerId = req.user.id;
      const bookingStarted = await bookingModel.findOne({
        worker: workerId,
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

      workerCache.del(`in-progress-bookings/${workerId}`);
      workerCache.del(`upcoming-bookings/${workerId}`);
      workerCache.del(`pending-bookings/${workerId}`);

      // send notifcation to worker
      const workerfuture = await workerModel.findById(workerId);
      if (workerId) {
        // send notification to worker
        notificationModel;
        const notification = new notificationModel({
          user: workerId,
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

      return {
        msg: "Booking Updated Successfully",
        status: 200,
        success: true,
        // booking: bookingStarted,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async addWorkerReviews(req, res) {
    try {
      const validationResults = await profileReceieveWorkerReviewValidator(
        req.body
      );

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { workerId, user, rating, review, userImage, name } = req.body;

      // check if worker is valid
      const reviewM = new reviewModel({
        worker: workerId,
        user,
        rating,
        review,
        name,
        userImage,
      });
      // save review
      await reviewM.save();
      return {
        msg: "Reveiw saved",
        status: 200,
        success: true,
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
      const workerId = req.user.id;
      // check if worker is valid
      console.log(6666);
      const reviewsPromise = await reviewModel
        .find({ worker: workerId })
        .limit(80)
        .sort({ date: -1 });
      const avgRatingPromise = await reviewModel
        .aggregate([
          {
            $match: { worker: workerId },
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
            },
          },
        ])
        .exec();
      const totalReviewsPromise = await reviewModel.countDocuments({
        worker: workerId,
      });
      const result = await Promise.all([
        reviewsPromise,
        avgRatingPromise,
        totalReviewsPromise,
      ]);

      const reviews = result[0];
      const avgRating = result[1];
      const totalReviews = result[2];
      if (reviews.length > 0) {
        reviews.avgRating = avgRating[0].avgRating ?? 0;
        reviews.total = totalReviews;
      }

      // set cache
      workerCache.set(`worker-review/${workerId}`, JSON.stringify(reviews));

      return {
        msg: "Review saved",
        status: 200,
        success: true,
        reviews,
        avgRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
        total: totalReviews,
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
      const validationResults = await availableSlotsValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
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

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        timeslots: availableSlots,
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
      // validate endpioint
      const validationResults = await bookSlotValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const {
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

      const workerId = req.user.id;

      const start = await findEarliestAvailableTimeSlot(workerId, day); // find earliest availble timeslor
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
        worker: workerId,
      });
      const workerToken = await workerModel.findById(workerId);
      // check if the phone numbers are available
      if (!clientPhone?.phone || !workerPhone?.phone) {
        return commonError(res, "Phone number not found.");
      }
      const newBooking = new bookingModel({
        worker: workerId,
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
        clientPhone: clientPhone?.phone,
        workerPhone: workerPhone?.phone,
      });

      const result = await newBooking.save(); // save booking
      // clear cache
      workerCache.del(`booking/${workerId}`);
      workerCache.del(`upcoming-bookings/${client}`);
      workerCache.del(`upcoming-bookings/${workerId}`);

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

      return {
        msg: "Booking Successful",
        status: 200,
        success: true,
        result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // verify payment
  async verifyPaymentWebhook(req, res) {
    try {
      const { event, data } = req.body;
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
          return {
            msg: "Payment Verified",
            status: 200,
          };
        }

        return {
          msg: "Payment Not Verified",
          status: 200,
        };
      }
      return {
        msg: "Payment Not Verified",
        status: 200,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // refund worker
  async refundWorker(req, res) {
    try {
      // refund payment and cancel booking.
      // Only refund 60% of the commitment fee
      const validationResults = await refundPaymentValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { reason } = req.body;
      const workerId = req.user.id;
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
      const workerToken = await workerModel.findById(workerId);
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
            { ref, worker: workerId },
            {
              cancelled: true,
              cancelledReason: reason,
              endTime: Date.now(),
            }
          );
          workerCache.del(`in-progress-bookings/${workerId}`);
          workerCache.del(`upcoming-bookings/${workerId}`);
          workerCache.del(`cancelled-bookings/${workerId}`);
          return {
            msg: "Refund Processed",
            status: 200,
            success: true,
          };
        });
      });
      refundRequest.write(refundDetails);
      refundRequest.end();
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async cancelWorker(req, res) {
    try {
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
          return {
            msg: "Refund Processed",
            status: 200,
            success: true,
          };
        });
      });
      refundRequest.write(refundDetails);
      refundRequest.end();
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async updateLocation(req, res) {
    try {
      const validationResults = await updateLocationValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, client, location, ref } = req.body;
      const workerId = req.user.id;
      // check if worker is valid
      // check if worker is valid
      const bookings = await bookingModel
        .findOneAndUpdate(
          {
            worker: workerId,
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

      return {
        msg: "Address Update Successfull",
        status: 200,
        success: true,
        bookings,
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
      const validationResults = await updateDateValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { client, date, day, ref } = req.body;
      const workerId = req.user.id;
      // check if worker is valid
      // check if worker is valid
      const bookings = await bookingModel.findOneAndUpdate(
        {
          worker: workerId,
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
      const workerToken = await workerModel.findById(workerId);
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

      return {
        msg: "Update Successfull",
        status: 200,
        success: true,
        bookings,
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
      if (!req.params.worker) return commonError(res, "Worker ID not provided");
      const workerToken = await workerModel.findById(req.params.worker);
      admin.messaging().sendToDevice(workerToken.token, {
        notification: {
          title: "Booking request",
          body: "You have a new booking request. Please check your dashboard to accept/reject the booking.",
        },
        // token: workerToken.token
      });
      // set cache
      return {
        msg: "Notification sent",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async getPopular(req, res) {
    try {
      const { id } = req.params;
      let profiles = [];

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

      return {
        status: 200,
        popularServices,
        highest: sortedWorkers,
        profiles,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerProfileService();
