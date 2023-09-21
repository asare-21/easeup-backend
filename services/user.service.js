const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
const { bookmarkModel } = require("../models/bookmark_model");
const { userModel } = require("../models/user_model");
const { notificationUserModel } = require("../models/nofications");
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
  loginUserValidator,
  passwordResetValidator,
} = require("../validators/user.validator");
const { isValidPassword, generatePassword } = require("../utils");
const { generateToken } = require("../passport/common");
const { PasswordReset } = require("../models/password_reset_model");
const userCache = cache;
class UserService {
  async createUserNotification(user, title, body, type, token) {
    try {
      // required field : user
      if (!user) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
      //check firebase if uid exists

      // Find the user
      userModel.findById(user, async (err, user) => {
        if (err) return log.error("Internal Server Error"); // Internal Server Error
        if (!user) return log.warn("User Not Found"); // User Not Found
        // Create the notification
        const notification = new notificationUserModel({
          user,
          title,
          message: body,
          type,
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
        deviceToken: req.body.token,
      });
      if (!updatedUser) return {
        msg: "User not found",
        status: 404,
        success: false
      }
      userCache.del(`user/${userId}`);

      return {
        msg: "Profile token updated",
        status: 200,
        success: true,

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
      if (!updatedUser) {
        return {
          msg: "User not found",
          status: 404,
          success: false,
        };
      }
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
      if (!updatedUser) {
        return {
          msg: "User not found",
          status: 404,
          success: false,
        };
      }
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
      const user = await userModel.findByIdAndUpdate(userId, {
        $set: {
          phone: phone,
          address: address,
          dob: dob,
          gender: gender,
        },
      });
      if (!user) {
        return {
          msg: "User not found",
          status: 404,
          success: false,
        };
      }
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
      const foundUser = await userModel.findByIdAndUpdate(userId, {
        code: code,
      });
      if (!foundUser) {
        return {
          msg: "User not found",
          status: 404,
          success: false,
        };
      }
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
      const updatedUser = await userModel.findByIdAndUpdate(userId, { code: "", phone });

      if (!updatedUser) {
        return {
          msg: "User not found",
          status: 404,
          success: false,
        };
      }

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
  async userLogin(req, res) {
    try {
      // validating request body submitted
      const validationResults = await loginUserValidator(req.body);

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
      const userExists = await userModel.findOne({ email });
      console.log(userExists)
      if (!userExists) {
        // User Already Exists
        return {
          msg: "Email or password incorrect",
          status: 400,
          success: false,
        };
      }

      const isPasswordValid = isValidPassword(
        password,
        userExists.passwordSalt,
        userExists.hashedPassword
      );

      if (isPasswordValid === false) {
        return {
          msg: "Incorrect email or password.",
          status: 400,
          success: false,
        };
      }

      const token = generateToken(userExists);

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
      const { email, profile_name, username, password } = req.body;

      const existingWorker = await workerModel.findOne({
        email
      }).exec();
      if (existingWorker) {
        // Worker Already Exists
        return {
          msg: "An account with this email exists. Account not created.",
          status: 400,
          success: false,
        };
      }
      // check if user already exists
      const userExists = await userModel.findOne({ email });
      console.log(userExists);
      if (userExists) {
        // User Already Exists
        return {
          msg: "An account with this email exists. Account not created.",
          status: 400,
          success: false,
        };
      } // User Already Exists

      const saltHash = generatePassword(password);
      const passwordSalt = saltHash.salt;
      const hashedPassword = saltHash.hash;
      // Create the user
      const user = new userModel({
        email,
        profile_name,
        hashedPassword,
        passwordSalt,
        username
      });
      await user.save();

      // // create notification
      // await createNotification(
      //   user._id,
      //   "Welcome to Easeup",
      //   "We're glad to have you on board. Enjoy your stay",
      //   "welcome",
      //   token
      // );
      // // send notification to update user profile
      // await createNotification(
      //   user._id,
      //   "Update your profile",
      //   "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
      //   "update_profile",
      //   token
      // );

      return { msg: "User Created", status: 200, success: true, }; // User Created
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
      const userNotifications = await notificationUserModel.find({ user: userId });

      if (!userNotifications) {
        return {
          msg: "User Not Found",
          status: 404,
          success: false,
        };
      }

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
      const notification = await notificationUserModel.findOneAndUpdate(
        { user: userId, _id: id },
        {
          read: true,
        }
      );

      if (!notification) {
        return {
          msg: "Notification Not Found",
          status: 404,
          success: false,
        };
      }

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

      // Find the bookmark and delete it
      await bookmarkModel.findByIdAndDelete(bookmark_id);
      return { msg: "Bookmark Deleted", status: 200, success: true }; // Bookmark Deleted
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
      const user = await userModel.findById(userId)
      if (!user) return { msg: "User not found", status: 404, success: false };

      // check if phone number matches the phone number on record
      if (user.phone !== phone) return { msg: "Phone number does not match", status: 400, success: false };

      // check if email matches the email on record
      if (user.email !== email) return { msg: "Email does not match", status: 400, success: false };

      // check password reset model if there is an existing code that has not been used and is not expired
      const exisitingCode = await PasswordReset.findOne({ user: userId, used: false, expiresAt: { $gt: Date.now() } })

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
      const passwordReset = new PasswordReset({
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
      const passwordReset = await PasswordReset.findOne({ user: userId, currentCode: code, used: false });

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
      await userModel.findOneAndUpdate({ _id: userId }, { passwordSalt, hashedPassword })

      // expire the code and mark it as used
      await PasswordReset.findOneAndUpdate({ _id: passwordReset._id }, { used: true })

      // send notification to user
      await this.createUserNotification(
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
      const user = await userModel.findOne({ email });
      if (!user) return {
        msg: "User not found",
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


      if (!user) return { msg: "User not found", status: 404, success: false };
      const userId = user._id


      // check if phone number matches the phone number on record
      if (user.phone !== phone) return { msg: "Phone number does not match", status: 400, success: false };

      // check if email matches the email on record
      if (user.email !== email) return { msg: "Email does not match", status: 400, success: false };

      // check password reset model if there is an existing code that has not been used and is not expired
      const exisitingCode = await PasswordReset.findOne({ user: userId, used: false, expiresAt: { $gt: Date.now() } })

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
      const passwordReset = new PasswordReset({
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
      const user = await userModel.findOne({ email });
      if (!user) return {
        msg: "User not found",
        status: 404,
        success: false
      }
      const userId = user._id

      if (!email || !password || !confirmPassword || !code)
        return { msg: "Bad Request. Required data not present. Please try again", status: 400, success: false };

      // check if the code submitted matches the code in the database
      const passwordReset = await PasswordReset.findOne({ user: userId, currentCode: code, used: false });

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
      await userModel.findOneAndUpdate({ _id: userId }, { passwordSalt, hashedPassword })

      // expire the code and mark it as used
      await PasswordReset.findOneAndUpdate({ _id: passwordReset._id }, { used: true })

      // send notification to user
      await this.createUserNotification(
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

module.exports = new UserService();
