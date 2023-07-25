const log = require("npmlog");
const otpGenerator = require("otp-generator");
const { cache } = require("../cache/user_cache");
const axios = require("axios");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");
const { workerProfileModel } = require("../models/worker_profile_model");
const {
  updateWorkerProfileValidator,
  updateWorkerPhoneValidator,
  updateWorkerPhoneVerifyCodeValidator,
} = require("../validators/workerProfileVerify.validator");

class WorkerProfileVerificationService {
  // worker profile verification data
  async findWorkerProfileVerification(req, res) {
    try {
      const workerId = req.user.id;
      // check if worker is valid
      const retrievedWorker = await workerProfileVerificationModel.findOne({
        worker: workerId,
      });
      if (!retrievedWorker) {
        return { status: 404, msg: "worker not found", success: false };
      }

      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        data: retrievedWorker,
      };
    } catch (e) {
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  // update selfie
  async updateWorkerDetails(req, res) {
    try {
      const validationResults = await updateWorkerProfileValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      const {
        selfie,
        ghanaCardDetails,
        address,
        age_doc,
        proof_skill,
        insurance_doc,
        gender,
      } = req.body;

      const workerId = req.user.id;
      // Update the worker
      const response = await Promise.all([
        workerProfileModel.findOneAndUpdate(
          {
            worker: workerId,
          },
          {
            profile_url: selfie,
          }
        ),
        workerProfileVerificationModel.findOneAndUpdate(
          { worker: workerId },
          {
            $set: {
              selfie,
              ghanaCardDetails,
              age_verification_document: age_doc,
              proof_skill,
              insurance_document: insurance_doc,
              gender,
              address,
            },
          }
        ),
      ]);
      if (!response[0] || !response[1])
        return { status: 404, msg: "worker not found", success: false };

      cache.del(`worker-profile/${workerId}`);
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerAddress(req, res) {
    try {
      const validationResults = await updateWorkerAddressValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, address, latlng } = req.body;

      // update address
      const updatedAddress =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            address: {
              address,
              latlng,
            },
          }
        );
      if (!updatedAddress) {
        return { status: 404, msg: "worker not found", success: false };
      }

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedAddress,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerPhone(req, res) {
    try {
      const validationResults = await updateWorkerPhoneValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { phone } = req.body;
      const workerId = req.user.id;
      // check if the phone number is equal to the one in the database
      const user = await workerProfileVerificationModel.findOne({
        worker: workerId,
      });

      if (!user) {
        return { status: 404, msg: "worker not found", success: false };
      }

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

      //update user with code
      await workerProfileVerificationModel.findOneAndUpdate(
        { worker: workerId },
        {
          code: code,
        }
      );
      return {
        msg: `Verification code has been sent to ${phone}`,
        status: 200,
        success: true,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerPhoneVerifyCode(req, res) {
    try {
      const validationResults = await updateWorkerPhoneVerifyCodeValidator(
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
      const { phone, code } = req.body;
      const workerId = req.user.id;
      // Find the user

      // check if the phone number is equal to the one in the database
      const user = await workerProfileVerificationModel.findOne({
        worker: workerId,
      });

      if (!user) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // Check if code matches
      if (user.code.toString() !== code.toString())
        return {
          msg: "Verification code is incorrect",
          status: 400,
          success: false,
        }; // Verification code is incorrect
      // Update the user if code matched
      await workerProfileVerificationModel.findOneAndUpdate(
        { worker: workerId },
        { code: "", phone }
      );

      return {
        msg: "Code has been verified successfully.",
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

module.exports = new WorkerProfileVerificationService();
