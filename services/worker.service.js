const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const { notificationWorkerModel } = require("../models/nofications");
const admin = require("firebase-admin");
const { commonError, returnUnAuthUserError } = require("../utils");
const { workerProfileModel } = require("../models/worker_profile_model");
const axios = require("axios");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");
const otpGenerator = require("otp-generator");
const { locationModel } = require("../models/workerLocationModel");
const { cache } = require("../cache/user_cache");
const {
  createWorkerValidator,
  updateWorkerLocationValidator,
  updateWorkerTokenValidator,
  updateWorkerGhcValidator,
  updateUserNotificationsValidator,
  loginWorkerValidator,
} = require("../validators/worker.validator");
const workerCache = cache;
const {
  createWorkerProfileAndVerification,
  generatePassword,
} = require("../utils");
const { isValidPassword } = require("../utils");
const { generateToken } = require("../passport/common");
const { WorkerPasswordReset } = require("../models/password_reset_model");
const { passwordResetValidator } = require("../validators/user.validator");

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
        const notification = new notificationWorkerModel({
          worker,
          title,
          message: body,
          type
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
      const workerId = req.user.id;
      // check if worker is valid
      const result = await workerModel.findById(workerId);

      workerCache.set(`worker/${workerId}`, result); //cache results

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        data: result,
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
      const workerId = req.user.id;
      // check if worker is valid
      // check if worker is valid
      const result = await workerModel.findById(workerId);

      if (!result) {
        return { status: 404, msg: "worker not found", success: false };
      }

      await Promise.all([
        workerModel.findByIdAndDelete(workerId),
        // bookingModel.deleteMany({ worker: worker }),
        workerProfileModel.deleteMany({ worker: workerId }),
        workerProfileVerificationModel.deleteMany({ worker: workerId }),
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
      const workerId = req.user.id;
      // check if worker is valid
      const result = await workerModel.findById(workerId);

      if (!result) {
        return { status: 404, msg: "worker not found", success: false };
      }

      workerCache.set(`worker-token/${result._id}`, result.token); //cache results

      await admin.messaging().sendToDevice(result.deviceToken, {
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
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      const { email, username, password, name } = req.body;

      // check if email exist
      const existingEmail = await workerModel.findOne({ email });

      if (existingEmail) {
        return {
          msg: "An account with this email  as a client. Sign in request denied.",
          status: 400,
          success: false,
        };
      }

      // check if user already exists as a worker
      const workerExists = await workerModel.findOne({ email });

      if (workerExists) {
        // User Already Exists
        return {
          msg: "An account with this email exists as a worker. Sign in request denied.",
          status: 400,
          success: true,
        };
      }

      const saltHash = generatePassword(password);
      const passwordSalt = saltHash.salt;
      const hashedPassword = saltHash.hash;
      // Create the user
      const worker = new workerModel({
        email,
        profile_name: name,
        name,
        hashedPassword,
        passwordSalt,
        username,
      });

      const savedWorker = await worker.save();

      await createWorkerProfileAndVerification(savedWorker._id, name);

      // // create notification
      // await this.createNotification(
      //   worker,
      //   "Welcome to Easeup",
      //   "We're glad to have you on board. Enjoy your stay",
      //   "welcome",
      //   token
      // );
      // // send notification to update user profile
      // await this.createNotification(
      //   worker,
      //   "Update your profile",
      //   "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
      //   "update_profile",
      //   token
      // );
      console.log("Hashed ", hashedPassword, "Salt ", passwordSalt)
      return {
        msg: "User Created",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // create worker
  async workerLogin(req, res) {
    try {
      // validating request body submitted
      const validationResults = await loginWorkerValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      const { email, password } = req.body;

      // check if email exist
      const workerExists = await workerModel.findOne({ email });
      console.log(workerExists)
      if (!workerExists) {
        // User Already Exists
        return {
          msg: "Email or password incorrect",
          status: 400,
          success: false,
        };
      }

      const isPasswordValid = isValidPassword(
        password,
        workerExists.passwordSalt,
        workerExists.hashedPassword
      );

      if (isPasswordValid === false) {
        return {
          msg: "Incorrect email or password.",
          status: 400,
          success: false,
        };
      }

      const token = generateToken(workerExists);

      return {
        msg: "login successfull",
        status: 200,
        success: true,
        token,
      };
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

      const { updates } = req.body;
      const workerId = req.user.id;

      locationModel.findOneAndUpdate(
        { worker: workerId },
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
              worker: workerId,
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
          return { status: 200, success: true };
        }
      );
      return {
        msg: "Worker location updated",
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
      const workerId = req.user.id;

      const validationResults = await updateWorkerTokenValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      // Find the user
      workerModel.findByIdAndUpdate(
        workerId,
        {
          deviceToken: req.body.token,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "Worker Not Found", status: 404, success: false }; // User Not Found
          workerCache.del(`worker/${workerId}`);

          return {
            msg: "Profile token updated",
            status: 200,
            success: true,
          }; // User Found and returned
        }
      );
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async updateGhanaCard(req, res) {
    try {
      const validationResults = await updateWorkerGhcValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { ghc, ghc_n, ghc_exp } = req.body;
      const workerId = req.user.id;

      // Find the user
      workerProfileVerificationModel.findOneAndUpdate(
        { worker: workerId },
        {
          // ghc_image: ghc,
          gh_card_to_face: ghc[0],
          gh_card_image_back: ghc[1],
          gh_card_image_front: ghc[2],
          ghc_number: ghc_n,
          ghc_exp: ghc_exp,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          cache.del(`worker/${workerId}`);

          return {
            msg: "Profile updated",
            status: 200,
            success: true,
            user,
          }; // User Found and returned
        }
      );
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async getWorkerNotifications(req, res) {
    try {
      const workerId = req.user.id;

      if (!workerId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists
      await // Find the user
        notificationWorkerModel.find({ worker: userId }, (err, notifications) => {
          if (err) return { msg: err.message, status: 500, success: false }; // Internal Server Error
          return {
            msg: "Notifications Found",
            status: 200,
            success: true,
            notifications,
          }; // Notifications Found and returned
        });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // delete worker
  async updateNotifications(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateUserNotificationsValidator(
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
      const workerId = req.user.id;
      const { id } = req.body;

      if (!userId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists
      await // Find the user
        notificationWorkerModel.findOneAndUpdate(
          { worker: workerId, _id: id },
          {
            read: true,
          },
          (err, notification) => {
            if (err) return { msg: err.message, status: 500, success: false }; // Internal Server Error
            return {
              msg: "Notification updated",
              status: 200,
              success: true,
              notification,
            }; // Notifications Found and returned
          }
        );
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  // Password reset within app
  // password reset OTP
  async sendResetCode(req, res) {
    try {
      const { email, phone } = req.body;
      const userId = req.user.id;

      const validationResults = await passwordResetValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      // check if email and phone match
      const user = await workerModel.findById(userId)
      if (!user) return { msg: "Worker not found", status: 404, success: false };

      // check if phone number matches the phone number on record
      if (user.phone !== phone) return { msg: "Phone number does not match", status: 400, success: false };

      // check if email matches the email on record
      if (user.email !== email) return { msg: "Email does not match", status: 400, success: false };

      // check password reset model if there is an existing code that has not been used and is not expired
      const exisitingCode = await WorkerPasswordReset.findOne({ user: userId, used: false, expiresAt: { $gt: Date.now() } })

      if (exisitingCode) {
        const message = `Your Easeup password reset code is ${exisitingCode.currentCode}. If you did not request for this code, please ignore this message. Also, do not share this code with anyone!`;

        const response = await axios.get(
          `https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`
        ); // wait for the sms to be sent

        if (response.data.handshake.label !== "HSHK_OK")
          return {
            msg: "Handshake error. Access Denied",
            status: 500,
            success: false,
          };
        else {
          log.info("Code sent successfully. Code was reused", exisitingCode.currentCode);
          return { msg: "Code sent successfully. Code was reused ", status: 200, success: true };
        }
      }

      // generate OTP
      const code = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      // create and save a password reset model
      const passwordReset = new WorkerPasswordReset({
        user: userId,
        currentCode: code,
        expiresAt: Date.now() + 1800000, // 30 minutes
      });

      await passwordReset.save();

      // send OTP to user's phone number
      const message = `Your Easeup password reset code is ${code}. If you did not request for this code, please ignore this message. Also, do not share this code with anyone!`;

      const response = await axios.get(
        `https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`
      ); // wait for the sms to be sent

      if (response.data.handshake.label !== "HSHK_OK")
        return {
          msg: "Handshake error. Access Denied",
          status: 500,
          success: false,
        }; // Internal Server Error

      return { msg: "Code sent successfully", status: 200, success: true };
    }
    catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }

  }
  // password reset route
  async resetPassword(req, res) {
    // data needed
    // email
    // password
    // confirm password
    // token

    try {
      const { email, password, confirmPassword, code } = req.body;
      const userId = req.user.id;

      if (!userId || !email || !password || !confirmPassword || !code)
        return { msg: "Bad Request. Required data not present. Please try again", status: 400, success: false };

      // check if the code submitted matches the code in the database
      const passwordReset = await WorkerPasswordReset.findOne({ user: userId, currentCode: code, used: false });

      if (!passwordReset) return { msg: "Invalid code", status: 400, success: false };

      // check if the code has expired
      if (passwordReset.expiresAt < Date.now()) return { msg: "Code has expired", status: 400, success: false };

      // check if password and confirm password match

      if (password !== confirmPassword) return { msg: "Passwords do not match", status: 400, success: false };

      // hash and salt password
      const saltHash = generatePassword(password);
      const passwordSalt = saltHash.salt;
      const hashedPassword = saltHash.hash;

      // update user's password
      await workerModel.findOneAndUpdate({ _id: userId }, { passwordSalt, hashedPassword })

      // expire the code and mark it as used
      await WorkerPasswordReset.findOneAndUpdate({ _id: passwordReset._id }, { used: true })

      // send notification to user
      await this.createNotification(
        userId,
        "Password reset successful",
        "Your password has been reset successfully. If you did not request for this, please change your password immediately.",
        "password_reset",
        "");
      return { msg: "Password reset successful", status: 200, success: true };
    }
    catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }

  }

  // Password reset outside app
  async sendResetCodeOutside(req, res) {
    try {
      const { email, phone } = req.body;
      const user = await workerModel.findOne({ email });
      if (!user) return {
        msg: "Worker not found",
        status: 404,
        success: false
      }

      const validationResults = await passwordResetValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }


      if (!user) return { msg: "Worker not found", status: 404, success: false };
      const userId = user._id


      // check if phone number matches the phone number on record
      if (user.phone !== phone) return { msg: "Phone number does not match", status: 400, success: false };

      // check if email matches the email on record
      if (user.email !== email) return { msg: "Email does not match", status: 400, success: false };

      // check password reset model if there is an existing code that has not been used and is not expired
      const exisitingCode = await WorkerPasswordReset.findOne({ user: userId, used: false, expiresAt: { $gt: Date.now() } })

      if (exisitingCode) {
        const message = `Your Easeup password reset code is ${exisitingCode.currentCode}. If you did not request for this code, please ignore this message. Also, do not share this code with anyone!`;

        const response = await axios.get(
          `https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`
        ); // wait for the sms to be sent

        if (response.data.handshake.label !== "HSHK_OK")
          return {
            msg: "Handshake error. Access Denied",
            status: 500,
            success: false,
          };
        else {
          log.info("Code sent successfully. Code was reused", exisitingCode.currentCode);
          return { msg: "Code sent successfully. Code was reused ", status: 200, success: true };
        }
      }

      // generate OTP
      const code = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      // create and save a password reset model
      const passwordReset = new WorkerPasswordReset({
        user: userId,
        currentCode: code,
        expiresAt: Date.now() + 1800000, // 30 minutes
      });

      await passwordReset.save();

      // send OTP to user's phone number
      const message = `Your Easeup password reset code is ${code}. If you did not request for this code, please ignore this message. Also, do not share this code with anyone!`;

      const response = await axios.get(
        `https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`
      ); // wait for the sms to be sent

      if (response.data.handshake.label !== "HSHK_OK")
        return {
          msg: "Handshake error. Access Denied",
          status: 500,
          success: false,
        }; // Internal Server Error

      return { msg: "Code sent successfully", status: 200, success: true };
    }
    catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async resetPasswordOutside(req, res) {
    try {
      const { email, password, confirmPassword, code } = req.body;
      const user = await workerModel.findOne({ email });
      if (!user) return {
        msg: "Worker not found",
        status: 404,
        success: false
      }
      const userId = user._id

      if (!email || !password || !confirmPassword || !code)
        return { msg: "Bad Request. Required data not present. Please try again", status: 400, success: false };

      // check if the code submitted matches the code in the database
      const passwordReset = await WorkerPasswordReset.findOne({ user: userId, currentCode: code, used: false });

      if (!passwordReset) return { msg: "Invalid code", status: 400, success: false };

      // check if the code has expired
      if (passwordReset.expiresAt < Date.now()) return { msg: "Code has expired", status: 400, success: false };

      // check if password and confirm password match

      if (password !== confirmPassword) return { msg: "Passwords do not match", status: 400, success: false };

      // hash and salt password
      const saltHash = generatePassword(password);
      const passwordSalt = saltHash.salt;
      const hashedPassword = saltHash.hash;

      // update user's password
      await workerModel.findOneAndUpdate({ _id: userId }, { passwordSalt, hashedPassword })

      // expire the code and mark it as used
      await WorkerPasswordReset.findOneAndUpdate({ _id: passwordReset._id }, { used: true })

      // send notification to user
      await this.createNotification(
        userId,
        "Password reset successful",
        "Your password has been reset successfully. If you did not request for this, please change your password immediately.",
        "password_reset",
        "");
      return { msg: "Password reset successful", status: 200, success: true };
    }
    catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerService();
