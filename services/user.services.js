const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const { userModel } = require("../models/user_model");
const { notificationModel } = require("../models/nofications");
const admin = require("firebase-admin");
const otpGenerator = require("otp-generator");
const axios = require("axios");
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Host: "api.smsonlinegh.com",
  Authorization: `key ${process.env.EASEUP_SMS_API_KEY}`,
};

const options = {
  method: "POST",
  headers: headers,
  hostname: "https://api.smsonlinegh.com/v4/message/sms/send",
};
const {
  getUserCache,
  cache,
  getUserNotificationsCache,
} = require("../cache/user_cache");
const {
  updateImageValidator,
  updateAddressValidator,
  updateGenderValidator,
  updateTokenValidator,
  updatePhoneValidator,
  updateGhcValidator,
  updateUserValidator,
  sendCodeValidator,
  verifyCodeValidator,
  createUserValidator,
  updateUserNotificationValidator,
} = require("../validators/user.validator");
const userCache = cache;
class UserService {
  // get worker
  async deleteUser(req, res) {
    try {
      const { user } = req.params;

      await Promise.all([userModel.findByIdAndDelete(user)]);
      return {
        msg: "user Profile Deleted",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async getUserProfile(req, res) {
    try {
      // required field : user_id
      const user_id = req.user.id;
      if (!user_id) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists
      console.log(req.user)
      // Find the user
      const userData = await userModel.findById(user_id);
      // cache data
      console.log("User data ", userData)
      if (!userData)
        return {
          msg: "Something went wrong. User not found",
          status: 500,
          success: false,
        }; // Internal Server Error

      userCache.set(`user/${user_id}`, userData);

      // return user data
      return {
        msg: "User Found",
        status: 200,
        success: true,
        user: userData,
      };
      // userModel.findById(user_id, (err, user) => {
      //     if (err) {
      //         log.warn(err.message)
      //         return res.status(500).json({ msg: err.message, status: 500, success: false }) // Internal Server Error
      //     }
      //     if (!user) return res.status(404).json({ msg: 'User Not Found', status: 404, success: false }) // User Not Found
      //     userCache.set(`user/${user_id}`, user);
      //     return res.status(200).json({
      //         msg: 'User Found', status: 200, success: true, user
      //     }) // User Found and returned
      // })
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateImage(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateImageValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, profile_picture } = req.body;
      // Find the user
      userModel.findByIdAndUpdate(
        req.user.id,
        {
          profile_picture: profile_picture,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          // load user from cache and update
          userCache.del(`user/${user_id}`);
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

  async updateAddress(req, res) {
    try {
      // validate endpoint
      const validationResults = await updateAddressValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, address, latlng } = req.body;

      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          address: {
            address,
            latlng,
          },
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          userCache.del(`user/${user_id}`);

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

  async updateGender(req, res) {
    try {
      // update gender
      const validationResults = await updateGenderValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, gender } = req.body;

      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          gender: gender,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          userCache.del(`user/${user_id}`);

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

  // get worker
  async updateToken(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateTokenValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, token } = req.body;
      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          token,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          userCache.del(`user/${user_id}`);

          return {
            msg: "Profile token updated",
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

  async updatePhone(req, res) {
    try {
      // required field : user_id
      const validationResults = await updatePhoneValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, phone } = req.body;

      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          phone: phone,
        },
        (err, user) => {
          if (err) {
            log.warn(err.message);
            return { msg: err.message, status: 500, success: false }; // Internal Server Error
          }
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          userCache.del(`user/${user_id}`);

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

  async updateGhanaCard(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateGhcValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, ghc, ghc_n, ghc_exp } = req.body;

      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          ghc_image: ghc,
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
          userCache.del(`user/${user_id}`);

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

  async updateUser(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateUserValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, gender, dob, phone, address } = req.body;

      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          $set: {
            phone: phone,
            address: address,
            dob: dob,
            gender: gender,
          },
        },
        (err, user) => {
          if (err)
            return {
              msg: "Internal Server Error",
              status: 500,
              success: false,
            }; // Internal Server Error
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          // Update the user
          return { msg: "User Updated", status: 200, success: true }; // User Updated
        }
      );
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updatePhoneSendCode(req, res) {
    try {
      // required field : user_id
      const validationResults = await sendCodeValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, phone } = req.body;

      // check if the phone number is equal to the one in the database
      const user = await userModel.findById(user_id);
      if (user.phone.toString() === phone.toString())
        return {
          msg: "Sorry. Operation not allowed",
          status: 400,
          success: false,
        }; // At least one field is required

      // Generate OTP and send SMS
      const code = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const body = {
        messages: [
          {
            text: `Your EaseUp verification code is ${code}. Please do not share this code with anyone.`,
            type: 1,
            sender: process.env.EASEUP_SMS_SENDER,
            destinations: {
              to: phone,
            },
          },
        ],
      };
      // Send SMS
      const message = `Your Easeup verification code is ${code}`;

      const response = await axios.get(
        `https://api.smsonlinegh.com/v4/message/sms/send?key=${process.env.EASEUP_SMS_API_KEY}&text=${message}&type=0&sender=${process.env.EASEUP_SMS_SENDER}&to=${phone}`
      ); // wait for the sms to be sent
      console.log(response);
      if (response.data.handshake.label !== "HSHK_OK")
        return {
          msg: "Handshake error. Access Denied",
          status: 500,
          success: false,
        }; // Internal Server Error
      // Find the user
      userModel.findByIdAndUpdate(
        user_id,
        {
          code: code,
        },
        async (err, user) => {
          if (err)
            return {
              msg: "Internal Server Error",
              status: 500,
              success: false,
            }; // Internal Server Error
          if (!user)
            return { msg: "User Not Found", status: 404, success: false }; // User Not Found
          userCache.del(`user/${user_id}`);

          // Update the user
          return {
            msg: `Verification code has been sent to ${phone}`,
            status: 200,
            success: true,
          }; // User Updated
        }
      );
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get worker
  async updatePhoneVerifyCode(req, res) {
    try {
      // required field : user_id
      const validationResults = await verifyCodeValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, phone, code } = req.body;

      // Find the user
      userModel.findById(user_id, async (err, user) => {
        if (err)
          return {
            msg: "Internal Server Error",
            status: 500,
            success: false,
          }; // Internal Server Error
        if (!user)
          return { msg: "User Not Found", status: 404, success: false }; // User Not Found
        // Check if code matches
        if (user.code.toString() !== code.toString())
          return {
            msg: "Verification code is incorrect",
            status: 400,
            success: false,
          }; // Verification code is incorrect
        // Update the user if code matched
        await userModel.findByIdAndUpdate(user_id, { code: "", phone });
        userCache.del(`user/${user_id}`);

        return {
          msg: `Code has been verified successfully.`,
          status: 200,
          success: true,
        }; // User Updated
      });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async createUser(req, res) {
    try {
      // required field : user_id
      const validationResults = await createUserValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id, email, profile_name, last_login, token } = req.body;

      const existingWorker = await workerModel.findById(user_id).exec();
      if (existingWorker) {
        // Worker Already Exists
        return {
          user: existingWorker,
          msg: "An account with this email exists as a worker. Sign in request denied.",
          status: 400,
          success: false,
        };
      }
      // check if user already exists
      const userExists = await userModel.findOne({ _id: user_id }).exec();
      console.log(userExists);
      if (userExists) {
        // User Already Exists
        return {
          user: userExists,
          msg: "User exists. Account not created",
          status: 200,
          success: true,
        };
      } // User Already Exists
      // Create the user
      const user = new userModel({
        email,
        profile_name,
        last_login,
        _id: user_id, // firebase uid. Required
        token,
        phone: req.body.phone || "",
        address: req.body.address || {},
        email_verified: req.body.email_verified || false,
        profile_picture: req.body.profile_picture || "",
      });
      user.save(async (err) => {
        console.log(err);
        if (err) return { msg: err.message, status: 500, success: false }; // Internal Server Error

        // create notification
        await createNotification(
          user_id,
          "Welcome to Easeup",
          "We're glad to have you on board. Enjoy your stay",
          "welcome",
          token
        );
        // send notification to update user profile
        await createNotification(
          user_id,
          "Update your profile",
          "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
          "update_profile",
          token
        );

        return { msg: "User Created", status: 200, success: true }; // User Created
      });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async getNotifications(req, res) {
    try {
      // required field : user_id
      const { user_id } = req.params;

      if (!user_id) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      notificationModel.find({ user: user_id }, (err, notifications) => {
        if (err) return { msg: err.message, status: 500, success: false }; // Internal Server Error
        // cache data
        userCache.set(
          `notifications/${user_id}`,
          JSON.stringify(notifications)
        );
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

  async updateNotifications(req, res) {
    try {
      // required field : user_id
      const validationResults = await updateUserNotificationValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { user_id } = req.params;
      const { id } = req.body;

      if (!user_id) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      notificationModel.findOneAndUpdate(
        { user: user_id, _id: id },
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

  async getBookmarks(req, res) {
    try {
      // required field : user_id
      const { user_id } = req.body;
      if (!user_id) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      userModel.findById(user_id, (err, user) => {
        if (err)
          return {
            msg: "Internal Server Error",
            status: 500,
            success: false,
          }; // Internal Server Error
        if (!user)
          return { msg: "User Not Found", status: 404, success: false }; // User Not Found
        // Find the bookmarks
        bookmarkModel.find({ user: user_id }, (err, bookmarks) => {
          if (err)
            return {
              msg: "Internal Server Error",
              status: 500,
              success: false,
            }; // Internal Server Error
          return {
            msg: "Bookmarks Found",
            status: 200,
            success: true,
            bookmarks,
          }; // Bookmarks Found and returned
        });
      });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async deleteBookmark(req, res) {
    try {
      // required field : user_id, bookmark_id
      const { user_id, bookmark_id } = req.body;
      if (!user_id || !bookmark_id)
        return { msg: "Bad Request", status: 400, success: false }; // User ID and Bookmark ID are required
      //check firebase if uid exists

      // Find the user
      userModel.findById(user_id, (err, user) => {
        if (err)
          return {
            msg: "Internal Server Error",
            status: 500,
            success: false,
          }; // Internal Server Error
        if (!user)
          return { msg: "User Not Found", status: 404, success: false }; // User Not Found
        // Find the bookmark and delete it
        bookmarkModel.findByIdAndDelete(bookmark_id, (err) => {
          if (err)
            return {
              msg: "Internal Server Error",
              status: 500,
              success: false,
            }; // Internal Server Error
          return { msg: "Bookmark Deleted", status: 200, success: true }; // Bookmark Deleted
        });
      });
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new UserService();
