const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
class WorkerService {
  async createNotification(worker, title, body, type, token) {
    try {
      // required field : worker
      if (!worker) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      workerModel.findById(worker, async (err, user) => {
        if (err) return log.error("Internal Server Error"); // Internal Server Error
        if (!user) return log.warn("User Not Found"); // User Not Found
        // Create the notification
        const notification = new notificationModel({
          user: worker,
          title: title,
          message: body,
          type: type,
        });

        const message = {
          notification: {
            title: title,
            body: body,
          },
          token: token,
        };

        await Promise.all([
          admin.messaging().send(message),
          notification.save(),
        ]);
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

  // get worker
  async findWorker(req, res) {
    try {
      const { worker } = req.params;
      // check if user is authenticated
      // check if worker is valid
      const result = await workerModel.findById(worker);

      workerCache.set(`worker/${worker._id}`, result); //cache results

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

  // delete worker
  async removeWorker(req, res) {
    try {
      const { worker } = req.params;
      // check if worker is valid

      // check if worker is valid
      const result = await workerModel.findById(worker);

      if (!result) {
        return { status: 404, msg: "worker not found", success: false };
      }

      await Promise.all([
        workerModel.findByIdAndDelete(worker),
        // bookingModel.deleteMany({ worker: worker }),
        workerProfileModel.deleteMany({ worker: worker }),
        workerProfileVerificationModel.deleteMany({ worker: worker }),
      ]);

      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get worker token
  async getWorkerToken(req, res) {
    try {
      const { worker } = req.params;
      // check if worker is valid
      const result = await workerModel.findById(worker);

      if (!result) {
        return { status: 404, msg: "worker not found", success: false };
      }

      workerCache.set(`worker-token/${result._id}`, result.token); //cache results

      await admin.messaging().sendToDevice(result.token, {
        notification: {
          title: "New job request",
          body: "You have a new job request from a user. Please check and accept or reject the request as soon as possible.",
        },
      });

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        // token: result.token
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // create worker
  async createWorker(req, res) {
    try {
      // validating request body submitted
      const validationResults = await createWorkerValidator(req.body);

      if (validationResults.status !== 200) {
        return res.status(400).json({
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        });
      }

      const { worker, email, profile_name, last_login, token } = req.body;

      const existingUser = await userModel.findById(worker);

      if (existingUser)
        return res.status(400).json({
          msg: "An account with this email exists as a client. Sign in request denied.",
          status: 400,
          success: false,
        });
      // At least one field is required

      // check if user already exists
      const userExists = await workerModel.findOne({ _id: worker }).exec();

      if (userExists) {
        // User Already Exists
        return res.status(200).json({
          user: userExists,
          msg: "An account with this email exists as a client. Sign in request denied.",
          status: 200,
          success: true,
        });
      } // User Already Exists
      // Create the user
      const user = new workerModel({
        email,
        name: profile_name,
        last_login,
        _id: worker, // firebase worker. Required
        token,
        phone: req.body.phone || "",
        address: req.body.address || {},
        profile_picture: req.body.profile_picture || "",
      });
      const userProfile = new workerProfileModel({
        worker,
        name: profile_name,
      });
      const userVerification = new workerProfileVerificationModel({
        worker,
      });
      user.save(async (err) => {
        console.log(err);
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        workerCache.set(`worker/${worker}`, {
          email,
          name: profile_name,
          last_login,
          _id: worker, // firebase worker. Required
          token,
          phone: req.body.phone || "",
          address: req.body.address || {},
          profile_picture: req.body.profile_picture || "",
        });

        await userProfile.save(async (err) => {
          if (err) {
            console.log(err);
            await workerModel.findOneAndDelete({ worker });
            // return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
          }
        });
        await userVerification.save(async (err) => {
          if (err) {
            console.log(err);
            await workerModel.findOneAndDelete({ worker });
            await workerProfileModel.findByIdAndDelete({ worker }); // return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
          }
        });
        // create notification
        await createNotification(
          worker,
          "Welcome to Easeup",
          "We're glad to have you on board. Enjoy your stay",
          "welcome",
          token
        );
        // send notification to update user profile
        await createNotification(
          worker,
          "Update your profile",
          "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
          "update_profile",
          token
        );
        return {
          msg: "User Created",
          status: 200,
          success: true,
        };
      });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async saveWorkerLocation(req, res) {
    try {
      /*
        *     "heading": Number,
    "lat": Number ,
    'lng': Number,
    'speed': Number,
    'accuracy': Number,
    'timestamp': Date.now
        * */
      // validating request body submitted
      const validationResults = await updateWorkerLocationValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      const { worker, updates } = req.body;

      locationModel.findOneAndUpdate(
        { worker },
        {
          $push: {
            logs: updates,
          },
        },
        (err, result) => {
          if (err) {
            return commonError(res, err.message);
          }

          if (!result) {
            //create and update
            locationModel({
              worker,
              logs: updates,
            }).save((err) => {
              if (err)
                return {
                  status: 400,
                  msg: "Something went wrong",
                  success: false,
                };
            });
          }
          return { success: true };
        }
      );
      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async updateWorkerToken(req, res) {
    try {
      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async updateGhanaCard(req, res) {
    try {
      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async getWorkerNotifications(req, res) {
    try {
      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async updateNotifications(req, res) {
    try {
      return {
        msg: "Worker Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerService();
