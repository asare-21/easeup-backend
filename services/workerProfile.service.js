const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { bookmarkModel } = require("../models/bookmark_model");
const { commentModel } = require("../models/comments_model");
const { mediaModel } = require("../models/mediaModel");
const { reviewModel } = require("../models/reviews_model");
const { workerProfileModel } = require("../models/worker_profile_model");
const { redisClient, DEFAULT_EXPIRATION } = require("../cache/user_cache");
const workerCache = redisClient;
const { bookingModel } = require("../models/bookingModel");
const { isValidDate } = require("../utils");
const { userModel } = require("../models/user_model");
const secret = process.env.PAYSTACK_SECRET;
const https = require("https");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");

const { notificationModel } = require("../models/nofications");
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
} = require("../validators/workerProfile.validator");
const { timeslotModel } = require("../models/timeslot_model");
class WorkerProfileService {
  // get worker
  async findWorker(req, res) {
    try {
      const worker = req.user.id;
      const { from, id } = req.query
      console.log(req.query)
      // check if uid is valid
      const workerPromise = (from === "user" && id) ? workerProfileModel.findOne({ worker: id }) : workerProfileModel.findOne({ worker });

      const rating = reviewModel
        .aggregate([
          {
            $match: { worker: (from === "user" && id) ? id : worker },
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
      let response = await Promise.all([workerPromise, rating, reviewModel.countDocuments({ worker: (from === "user" && id) ? id : worker })])
      if (!response[0]) return {
        msg: "Worker not found",
        success: false,
        status: 500,

      }
      if (response[1].length > 0) avgRating = response[1].avgRating ?? 0;

      const totalReviews = response[2]

      if (response[0] !== null) {
        response[0].rating = avgRating;
        response[0].totalReviews = totalReviews;
        response[0].jobs = totalReviews;
      }

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        worker: response[0] ?? {},
        avgRating: avgRating ?? 0,
        totalReviews,
      };

    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker reviews
  async findWorkerReviews(req, res) {
    try {
      const worker = req.user.id;
      // check if uid is valid
      const foundWorker = await reviewModel.find({ worker });

      if (foundWorker)
        await workerCache.setEx(`reviews/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(foundWorker));

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker comments
  async findWorkerComments(req, res) {
    try {
      const { worker, post } = req.params;
      // check if uid is valid
      const posts = await commentModel.find({ post });
      // set cache
      await workerCache.setEx(`comments/${post}`, DEFAULT_EXPIRATION, JSON.stringify(posts));
      return {
        msg: "Comments fetched",
        status: 200,
        success: true,
        posts,
      };
    } catch (e) {
      console.error(e)

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

      const worker = req.user.id;
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

      await Promise.all([
        admin.messaging().sendToDevice(workerData.deviceToken, {
          notification: {
            title: "New comment",
            body: `${name} commented on your post`,
          },
          data: {
            type: "comment",
            post,
          },
        }),
        newComment.save()
      ])
      return {
        msg: "Comment Added",
        status: 200,
        success: true,
        comment,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // add worker charge
  async addWorkerCharge(req, res) {
    try {
      const { worker, charge } = req.body;
      const validationResults = await profileChargeValidator(req.body);

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
        { worker },
        {
          base_price: charge,
        }
      );
      await workerCache.del(`worker-profile/${worker}`);
      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // add worker skills
  async addWorkerSkills(req, res) {
    try {
      const validationResults = await profileSkillsUpdateValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
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
      await workerCache.del(`worker-profile/${worker}`);
      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // add worker bio
  async addWorkerBio(req, res) {
    try {
      const { worker, bio } = req.body;
      const validationResults = await profileBioUpdateValidator(req.body);

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
        { worker },
        {
          $set: {
            bio,
          },
        }
      );
      await workerCache.del(`worker-profile/${worker}`);
      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker instagram
  async addWorkerInstagram(req, res) {
    try {
      const { worker, ig } = req.body;
      const validationResults = await profileIGUpdateValidator(req.body);

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
        { worker },
        {
          $set: {
            "links.instagram": ig,
          },
        }
      );
      await workerCache.del(`worker-profile/${worker}`);

      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // add worker twitter
  async addWorkeTwitter(req, res) {
    try {
      const { worker, twitter } = req.body;
      const validationResults = await profileTwitterUpdateValidator(req.body);

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
        { worker },
        {
          $set: {
            "links.twitter": twitter,
          },
        }
      );
      await workerCache.del(`worker-profile/${worker}`);

      return {
        msg: "Worker Profile Updated",
        status: 200,
        success: true,
        worker: foundWorker,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // add worker portfolio
  async addWorkerPortfolio(req, res) {
    try {
      const { worker, media, description, thumbnail, image } = req.body;
      const validationResults = await profilePortfolioUpdateValidator(req.body);

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
        worker,
        url: media,
        description,
        image,
        thumbnail,
      });
      newMedia.save((err, worker) => {
        if (err) {
          console.log(err);
          return {
            msg: "Something went wrong",
            status: 400,
            success: false,
          };
        }
        return {
          msg: "Worker Profile Updated",
          status: 200,
          success: true,
          worker,
        };
      });
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  // get worker portfolio
  async getWorkerPortfolioPage(req, res) {
    try {
      const { worker, page } = req.params;
      const pageSize = 10;
      // check if worker is valid
      const posts = await mediaModel
        .find({ worker })
        .limit(pageSize)
        .skip((page - 1) * pageSize); // get 5 posts per page
      if (!posts) return {
        msg: "Portfolio not found",
        status: 400,
        success: false,
      };
      await workerCache.setEx(`portfolio/${page}/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(posts));
      return {
        msg: "Worker Profile Media Fetched Successfully",
        status: 200,
        success: true,
        worker: posts,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  async addWorkerRadius(req, res) {
    try {
      const { worker, radius } = req.body;
      const validationResults = await profileWorkRadiusUpdateValidator(
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
      // check if worker is valid
      if (radius.radius > 50 || radius.radius < 5)
        return {
          msg: "Insufficient radius",
          status: 400,
          success: false,
        };
      workerProfileModel.findOneAndUpdate(
        { worker },
        {
          work_radius: radius,
        },
        (err, worker) => {
          if (err)
            return {
              msg: err.message,
              status: 400,
              success: false,

            }

          return {
            msg: "Worker Profile Updated",
            status: 200,
            success: true,
            worker,
          };
        }
      );
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  //get worker booking
  async findBooking(req, res) {
    try {
      const worker = req.user.id;
      // check if worker is valid
      console.log(worker)
      const bookings = await bookingModel.find({ worker }).populate("jobId").populate("slot").exec();
      // set cache
      await workerCache.setEx(`booking/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  // get paid booking
  async findPaidBooking(req, res) {
    try {
      const { user } = req.params;
      const bookings = await bookingModel.find({ client: user, isPaid: true }).populate("jobId").populate("slot").exec();
      // set cache
      await workerCache.setEx(`paid-bookings/${user}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  // get upcoming booking
  async findUpcomingBooking(req, res) {
    try {
      const worker = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      // console.log("User variable ", user)
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: req.user.id,
        isPaid: true,
        cancelled: false,
        started: false,
      }).populate("jobId").populate("slot").exec();
      console.log("Fetched bookings ", bookings);
      // set cahce
      await workerCache.setEx(`upcoming-bookings/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get pending booking
  async findPendingBooking(req, res) {
    try {
      const worker = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      console.log("User variable ", Boolean("false"));
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: req.user.id,
        isPaid: true,
        cancelled: false,
        started: true,
        pending: true,
      }).populate("jobId").populate("slot").exec();
      console.log("Fetched bookings ", bookings);
      // set cahce
      await workerCache.setEx(`pending-bookings/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));

      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get upcommming
  async findBookingInProgress(req, res) {
    try {
      const worker = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: worker,
        isPaid: true,
        completed: false,
        started: true,
        pending: false,
      }).populate("jobId").populate("slot").exec();
      console.log("Fetched bookings ", bookings);
      // set cahce
      await workerCache.set(`in-progress-bookings/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get completed booking
  async findCompletedBooking(req, res) {
    try {
      const worker = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: req.user.id,
        isPaid: true,
        completed: true,
        started: true,
      }).populate("jobId").populate("slot").exec();

      // set cache
      await workerCache.setEx(`completed-bookings/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      }
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findCancelledBooking(req, res) {
    try {
      const worker = req.user.id;
      const { user } = req.query;
      // check if worker is valid
      // const bookings = await bookingModel.find({ [user == true || 'true' ? 'client' : 'worker']: worker, isPaid: true, completed: false, cancelled: true })
      const bookings = await bookingModel.find({
        [user === "true" ? "client" : "worker"]: req.user.id,
        isPaid: true,
        completed: false,
        cancelled: true,
      }).populate("jobId").populate("slot").exec();
      // set cache
      await workerCache.set(`cancelled-bookings/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(bookings));
      return {
        msg: "Worker Profile Fetched Successfully",
        status: 200,
        success: true,
        bookings,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // update booking status
  async updateBookingStatus(req, res) {
    try {
      // const validationResults = await profileWorkRadiusUpdateValidator(
      //   req.body
      // );

      // if (validationResults.status !== 200) {
      //   return {
      //     msg: "Bad Request. Missing fields",
      //     status: 400,
      //     success: false,
      //     validationResults: validationResults.msg,
      //   };
      // }
      const { worker, client, ref } = req.body;
      const { started, completed } = req.query;
      if (!completed) {
        // check if any bookng has been started but not completed,
        // check to see if booking was started but cancelled
        // check to see if booking was started but completed

        const bookingStarted = await bookingModel.findOne({
          worker,
          client,
          started: true,
          $or: [
            { completed: false },
            { cancelled: true }
          ]
        });
        // if found booking has the same ref as the one being updated, then update it otherwise, return error
        if (bookingStarted && bookingStarted.ref !== ref)
          return {
            msg: "Booking already started",
            status: 400,
            success: false,
          };
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
      if (!booking) return {
        msg: "Booking not available",
        status: 400,
        success: false,
      };
      await workerCache.del(`in-progress-bookings/${worker}`);
      await workerCache.del(`upcoming-bookings/${worker}`);

      return {
        msg: "Booking Updated Successfully",
        status: 200,
        success: true,
        booking,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // mark booking as pending
  async markBookingAsPending(req, res) {
    try {
      const validationResults = await profileWorkRadiusUpdateValidator(
        req.body
      );

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 500,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, client, ref } = req.body;
      const bookingStarted = await bookingModel.findOne({
        worker,
        client,
        ref,
        started: true,
        completed: false,
      }).populate("jobId").populate("slot").exec();

      if (!bookingStarted)
        return {
          msg: "Something went wrong",
          status: 500,
          success: false,
        };

      // update
      bookingStarted.pending = true;
      await bookingStarted.save();


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


        await Promise.all([
          notification.save(),
          // send notification to client using Firebase Cloud Messaging
          workerCache.del(`in-progress-bookings/${worker}`),
          workerCache.del(`upcoming-bookings/${worker}`),
          workerCache.del(`pending-bookings/${worker}`),
          admin.messaging().send(workerfuture.deviceToken, {
            notification: {
              title: "Booking Pending",
              body: `Your booking with ${bookingStarted.clientName} has been marked as pending. Please contact the client to resolve the issue.`,
            },
          })
        ])
      }

      return {
        msg: "Booking Updated Successfully",
        status: 200,
        success: true,
        // booking: bookingStarted,
      };
    } catch (e) {
      console.error(e)

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
      return {
        msg: "Reveiw saved",
        status: 200,
        success: true,
      };
    } catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async findWorkerReviews(req, res) {
    try {
      const worker = req.params.worker;
      // check if worker is valid

      const reviewsPromise = reviewModel
        .find({ worker })
        .limit(80)
        .sort({ date: -1 });
      const avgRatingPromise = reviewModel
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
      const totalReviewsPromise = reviewModel.countDocuments({ worker });
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
      await workerCache.setEx(`worker-review/${worker}`, DEFAULT_EXPIRATION, JSON.stringify(reviews));

      return {
        msg: "Review saved",
        status: 200,
        success: true,
        reviews,
        avgRating: avgRating[0].avgRating ?? 0,
        total: totalReviews,
      };
    } catch (e) {
      console.error(e)

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
      console.error(e)

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
        worker,
        client,
        skills,
        name,
        fee,
        jobId,
        ref,
        latlng,
        image,
        workerImage,
        day,
        photos,
        clientName,
        basePrice,
        slot,
        date
      } = req.body;

      // const start = await findEarliestAvailableTimeSlot(worker, day); // find earliest availble timeslor
      // console.log("Generated start time ", start);
      // if (!start) {
      //   return commonError(
      //     res,
      //     "No available time slots for the selected day. Please choose another day."
      //   );
      // }

      // const end = new Date(start).getTime() + 2 * 60 * 60 * 1000; // Calculate the end time (2 hours after the start time)

      // get client and worker phone numbers
      const clientPhone = await userModel.findById(client);

      const workerPhone = await workerProfileVerificationModel.findOne({
        worker,
      });
      const workerToken = await workerModel.findById(worker);
      // check if the phone numbers are available
      if (!clientPhone.phone || !workerPhone.phone) {
        return {
          msg: "Phone number required",
          status: 400,
          success: false,
        };
      }
      // before saving booing, check to see if the timeslot has a booking id.
      // if it has a booking id, request for that booking and check if it has been cancelled.
      // proceed with the booking if it has been cancelled
      const timeslot = await timeslotModel.findById(slot);
      if (timeslot.bookingId) {
        const booking = await bookingModel.findById(timeslot.bookingId);
        if (!booking.cancelled) {
          return {
            msg: "Booking not available",
            status: 400,
            success: false,
          };
        }
      }
      // save booking
      const newBooking = new bookingModel({
        worker,
        client,
        start: date,
        end: req.body.end,
        skills,
        name,
        clientName,
        ref,
        latlng,
        image,
        workerImage,
        commitmentFee: fee,
        day,
        date,
        jobId,
        photos,
        basePrice,
        clientPhone: clientPhone.phone,
        workerPhone: workerPhone.phone,
        slot
      });

      const result = await newBooking.save(); // save booking


      // Send notifications to the worker and client    

      if (workerPhone && clientPhone)
        await Promise.all([
          admin.messaging().sendToDevice(workerToken.deviceToken, {
            notification: {
              title: "New Booking",
              body: "You have a new booking. Please check your dashboard for more details.",
            },
            // token: workerToken.deviceToken
          }),
          admin.messaging().sendToDevice(clientPhone.deviceToken, {
            notification: {
              title: "New Booking",
              body: "Your booking was successful. Awaiting payment.",
            },
            // token: clientPhone.deviceToken
          }),
          // clear cache
          workerCache.del(`booking/${worker}`),
          workerCache.del(`upcoming-bookings/${client}`),
          workerCache.del(`upcoming-bookings/${worker}`)
        ]);

      return {
        msg: "Booking Successful",
        status: 200,
        success: true,
        result,
      };
    } catch (e) {
      console.error(e)

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
            },
            { new: true }
          );
          console.log("Found booking ", booking);
          if (!booking) return {
            msg: "Booking not found",
            status: 400,
            success: false,
          };
          // update time slot for worker
          await timeslotModel.findOneAndUpdate({
            _id: booking.slot,
          },
            {
              bookingId: booking._id
            }
          )
          // send notification to device of worker and client
          const workerToken = await workerModel.findById(booking.worker);
          const userToken = await userModel.findById(booking.client);

          const date = new Date(workerToken.date);
          const parseDate = date.toDateString();

          await Promise.all([
            admin.messaging().sendToDevice(workerToken.deviceToken, {
              notification: {
                title: "Booking Confirmed",
                body:
                  workerToken.name +
                  "has just booked you for " +
                  parseDate +
                  " Payment for your booking has been verified. Please check your dashboard for more details",
              },
            }),
            admin.messaging().sendToDevice(userToken.deviceToken, {
              notification: {
                title: "Payment Verified",
                body: "Payment for your booking has been verified",
              },
            })
          ]
          )
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
      console.error(e)

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


          await Promise.all([
            admin.messaging().sendToDevice(userToken.deviceToken, {
              notification: {
                title: "Refund Processed",
                body: "Your booking has been cancelled and refund processed",
              },
            }),
            admin.messaging().sendToDevice(workerToken.deviceToken, {
              notification: {
                title: "Sorry, Booking Cancelled",
                body: "The customer has cancelled the booking. Please check your dashboard for more details",
              },
            }),
            workerCache.del(`in-progress-bookings/${worker}`),
            workerCache.del(`upcoming-bookings/${worker}`),
            workerCache.del(`cancelled-bookings/${worker}`)
          ])
          // send notification to device of worker and client

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
      console.error(e)

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
      const userToken = await userModel.findById(req.user.id);
      // Set refund details
      const refundDetails = JSON.stringify({
        transaction: foundBooking.ref,
        amount: foundBooking.commitmentFee * 100 * 0.7,
      });

      const refundRequest = https.request(options, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", async () => {
          console.log(JSON.parse(data));
          const response = JSON.parse(data)

          // update booking to cancelled
          const foundBooking = await bookingModel.findOneAndUpdate(
            { ref },
            {
              cancelled: true,
              // cancelledReason: reason,
              slot: "",
              endTime: Date.now(),
            }
          );
          if (foundBooking) await timeslotModel.findOneAndUpdate({
            ref: foundBooking._id
          }, {
            bookingId: ""
          })
          await Promise.all([
            admin.messaging().sendToDevice(userToken.deviceToken, {
              notification: {
                title: "Booking Cancelled.",
                body: "Your booking has been cancelled successfully. You will a 70% refund within 3-5 working days",
              },
            }),
            admin.messaging().sendToDevice(workerToken.deviceToken, {
              notification: {
                title: "Sorry, Booking Cancelled",
                body: "The customer has cancelled the booking. Please check your dashboard for more details",
              },
            }),
          ]); // parallel async

        });
      });
      refundRequest.write(refundDetails);
      refundRequest.end();

      return {
        msg: "request Processed",
        status: 200,
        success: true,
      };
    } catch (e) {
      console.error(e)

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
      if (!bookings) return {
        msg: "Booking not found",
        status: 400,
        success: false,
      };

      console.log(bookings, typeof location[0], typeof location[1]);
      // send notification to device of worker and client
      const workerToken = await workerModel.findById(worker);
      const userToken = await userModel.findById(client);
      await Promise.all([
        admin.messaging().sendToDevice(userToken.deviceToken, {
          notification: {
            title: "Location update successfull",
            body: "Your location has been updated. We will notify the worker.",
          },
        }),
        admin.messaging().sendToDevice(workerToken.deviceToken, {
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
      console.error(e)

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
      if (!bookings) return {
        msg: "Booking not available",
        status: 400,
        success: false,
      };

      console.log(bookings);
      // send notification to device of worker and client
      const workerToken = await workerModel.findById(worker);
      const userToken = await userModel.findById(client);
      await Promise.all([
        admin.messaging().sendToDevice(userToken.deviceToken, {
          notification: {
            title: "Date update successfull",
            body: "New date has been updated. We will notify the worker.",
          },
        }),
        admin.messaging().sendToDevice(workerToken.deviceToken, {
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
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }
  // get worker
  async notifyWorker(req, res) {
    try {
      if (!req.params.worker) return {
        msg: "Booking not available",
        status: 400,
        success: false,
      };
      const workerToken = await workerModel.findById(req.params.worker);
      await admin.messaging().sendToDevice(workerToken.deviceToken, {
        notification: {
          title: "Booking request",
          body: "You have a new booking request. Please check your dashboard to accept/reject the booking.",
        },
        // token: workerToken.deviceToken
      });
      // set cache
      return {
        msg: "Notification sent",
        status: 200,
        success: true,
      };
    } catch (e) {
      console.error(e)

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

      // get the profiles of the sorted workers
      for (const foundWorker of sortedWorkers) {
        const foundProfile = await workerProfileModel.findOne({
          worker: foundWorker,
        });
        // console.log("Found profile", foundProfile);

        if (foundProfile) {
          // get avg rating of worker
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

          if (rating.length > 0) {
            foundProfile.rating = rating[0].avgRating ?? 0;
          }
          profiles.push(foundProfile);
        }
      }
      // set cache
      await workerCache.setEx(
        `popular-workers`,
        DEFAULT_EXPIRATION,
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
      console.error(e)

      return { status: 500, msg: e.message, success: false };
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;

      const post = await mediaModel.findByIdAndDelete(id);
      if (!post) return {
        status: 404,
        msg: "Post not found",
        success: false,
      };

      return {
        status: 200,
        msg: "Post deleted successfully",
        success: true,
      };
    }
    catch (e) {
      console.error(e)

      return { status: 500, msg: e.message, success: false }
    }
  }
}

module.exports = new WorkerProfileService();
