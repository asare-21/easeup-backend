const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const { bookmarkModel } = require("../models/bookmark_model");
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
      const userId = req.user.id;
      if (!userId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required

      // Find the user
      const userData = await userModel.findById(userId);
      // cache data
      console.log("User data ", userData)
      if (!userData)
        return {
          msg: "Something went wrong. User not found",
          status: 500,
          success: false,
        }; // Internal Server Error

      userCache.set(`user/${userId}`, userData);

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
      const validationResults = await updateImageValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { profile_picture } = req.body;
      const userId = req.user.id;
      if (!userId) return { msg: "Bad Request", status: 400, success: false };
      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        profile_picture: profile_picture,
      });
      // load user from cache and update
      userCache.del(`user/${userId}`);
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returned
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
      const { address, latlng } = req.body;
      const userId = req.user.id;
      if (!userId) return { msg: "Bad Request", status: 400, success: false };

      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        address: {
          address,
          latlng,
        },
      });
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returnedI
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
      const { gender } = req.body;
      const userId = req.user.id;

      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        gender: gender,
      });
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returned
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
      const { token } = req.body;
      const userId = req.user.id;
      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        token,
      });
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile token updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returned
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updatePhone(req, res) {
    try {
      const validationResults = await updatePhoneValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { phone } = req.body;
      const userId = req.user.id;

      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        phone: phone,
      });
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returned
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateGhanaCard(req, res) {
    try {
      const validationResults = await updateGhcValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { ghc, ghc_n, ghc_exp } = req.body;
      const userId = req.user.id;

      // Find the user
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        ghc_image: ghc,
        ghc_number: ghc_n,
        ghc_exp: ghc_exp,
      });
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        updatedUser,
      }; // User Found and returned
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateUser(req, res) {
    try {
      const validationResults = await updateUserValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { gender, dob, phone, address } = req.body;
      const userId = req.user.id;

      // Find the user
      await userModel.findByIdAndUpdate(userId, {
        $set: {
          phone: phone,
          address: address,
          dob: dob,
          gender: gender,
        },
      });
      // Update the user
      return { msg: "User Updated", status: 200, success: true };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updatePhoneSendCode(req, res) {
    try {
      const validationResults = await sendCodeValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { phone } = req.body;
      const userId = req.user.id;

      // check if the phone number is equal to the one in the database
      const user = await userModel.findById(userId);
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
      await userModel.findByIdAndUpdate(userId, {
        code: code,
      });
      userCache.del(`user/${userId}`);

      // Update the user
      return {
        msg: `Verification code has been sent to ${phone}`,
        status: 200,
        success: true,
      }; // User Updated
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // get worker
  async updatePhoneVerifyCode(req, res) {
    try {
      const validationResults = await verifyCodeValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { phone, code } = req.body;
      const userId = req.user.id;

      // Find the user
      const user = await userModel.findById(userId);
      // Internal Server Error

      if (!user) return { msg: "User Not Found", status: 404, success: false };
      // Check if code matches
      if (user.code.toString() !== code.toString()) {
        return {
          msg: "Verification code is incorrect",
          status: 400,
          success: false,
        };
      }
      // Verification code is incorrect
      // Update the user if code matched
      await userModel.findByIdAndUpdate(userId, { code: "", phone });
      userCache.del(`user/${userId}`);

      return {
        msg: `Code has been verified successfully.`,
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async createUser(req, res) {
    try {
      const validationResults = await createUserValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { email, profile_name, last_login, token } = req.body;
       const userId = req.user.id;

      const existingWorker = await workerModel.findById(userId).exec();
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
      const userExists = await userModel.findOne({ _id: userId }).exec();
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
        _id: userId, // firebase uid. Required
        token,
        phone: req.body.phone || "",
        address: req.body.address || {},
        email_verified: req.body.email_verified || false,
        profile_picture: req.body.profile_picture || "",
      });
      await user.save();

      // create notification
      await createNotification(
        userId,
        "Welcome to Easeup",
        "We're glad to have you on board. Enjoy your stay",
        "welcome",
        token
      );
      // send notification to update user profile
      await createNotification(
        userId,
        "Update your profile",
        "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
        "update_profile",
        token
      );

      return { msg: "User Created", status: 200, success: true }; // User Created
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists
      // Find the user
      const userNotifications = await notificationModel.find({ user: userId });

      // cache data
      userCache.set(
        `notifications/${userId}`,
        JSON.stringify(userNotifications)
      );
      return {
        msg: "Notifications Found",
        status: 200,
        success: true,
        userNotifications,
      }; // Notifications Found and returned
    } catch (e) {
      console.log(77);
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateNotifications(req, res) {
    try {
      const validationResults = await updateUserNotificationValidator(req.body);
      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { id } = req.body;
      const userId = req.user.id;

      if (!userId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      const notification = await notificationModel.findOneAndUpdate(
        { user: userId, _id: id },
        {
          read: true,
        }
      );
      return {
        msg: "Notification updated",
        status: 200,
        success: true,
        notification,
      }; // Notifications Found and returned
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async getBookmarks(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      const retrievedUser = userModel.findById(userId);

      if (!retrievedUser)
        return { msg: "User Not Found", status: 404, success: false }; // User Not Found
      // Find the bookmarks
      const userBookmarks = await bookmarkModel.find({ user: userId });
      return {
        msg: "Bookmarks Found",
        status: 200,
        success: true,
        userBookmarks,
      }; // Bookmarks Found and returned
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async deleteBookmark(req, res) {
    try {
      const { bookmark_id } = req.body;
      const userId = req.user.id;

      if (!userId || !bookmark_id)
        return { msg: "Bad Request", status: 400, success: false }; // User ID and Bookmark ID are required
      //check firebase if uid exists

      // Find the user
      await userModel.findById(userId),
        // Find the bookmark and delete it
      await bookmarkModel.findByIdAndDelete(bookmark_id);
      return { msg: "Bookmark Deleted", status: 200, success: true }; // Bookmark Deleted
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new UserService();
