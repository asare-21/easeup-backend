const log = require("npmlog");
const otpGenerator = require("otp-generator");
const { cache } = require("../cache/user_cache");
const axios = require("axios");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");
const { workerProfileModel } = require("../models/worker_profile_model");
const {
  updateWorkerProfileImageValidator,
  updateWorkerGhImagesValidator,
  updateWorkerAgeValidator,
  updateWorkerProofOfSkillValidator,
  updateWorkerInsuranceValidator,
  updateWorkerAddressValidator,
  updateWorkerGenderValidator,
  updateWorkerPhoneValidator,
  updateWorkerPhoneVerifyCodeValidator,
} = require("../validators/workerProfileVerify.validator");

class WorkerProfileVerificationService {
  // worker profile verification data
  async findWorkerProfileVerification(req, res) {
    try {
      const { worker } = req.params;
      // check if worker is valid
      const retrievedWorker = await workerProfileVerificationModel.findOne({
        worker,
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
  async updateWorkerSelfie(req, res) {
    try {
      const validationResults = await updateWorkerProfileImageValidator(
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

      const { worker, selfie } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // Update the worker
   await Promise.all([
    workerProfileModel.findOneAndUpdate(
        {
          worker,
        },
        {
          profile_url: selfie,
        }
      )
      , workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        selfie,
      },)  
   ])
      cache.del(`worker-profile/${worker}`);
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

  //accepts url of front and back of ghana card
  // update ghc front
  // update ghc back
  async updateWorkerGhanaCard(req, res) {
    try {
      const validationResults = await updateWorkerGhImagesValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }

      // destruct the request body
      const {
        worker,
        gh_card_image_back,
        gh_card_image_front,
        gh_card_to_face,
      } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // update worker
      const updatedWorker =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            gh_card_to_face,
            gh_card_image_front,
            gh_card_image_back,
          }
        );
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedWorker,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
  async updateWorkerAge(req, res) {
    try {
      const validationResults = await updateWorkerAgeValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, age_doc } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // Find the user
      const updatedWorkerAge =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            age_verification_document: age_doc,
          }
        );

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedWorkerAge,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerProofOfSkill(req, res) {
    try {
      const validationResults = await updateWorkerProofOfSkillValidator(
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
      const { worker, proof_skill } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // Update worker proof of skill
      const updatedWorkerPos =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            proof_skill,
          }
        );

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedWorkerPos,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }

  async updateWorkerInsurance(req, res) {
    try {
      const validationResults = await updateWorkerInsuranceValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, insurance_doc } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // Update worker insurance
      const updatedWorkerInsurance =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            insurance_document: insurance_doc,
          }
        );

      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedWorkerInsurance,
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

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

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

  async updateWorkerGender(req, res) {
    try {
      // required field : worker
      const validationResults = await updateWorkerGenderValidator(req.body);

      if (validationResults.status !== 200) {
        return {
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        };
      }
      const { worker, gender } = req.body;

      // check if user exist
      const userExist = await workerProfileVerificationModel.findOne({
        worker,
      });

      if (!userExist) {
        return { status: 404, msg: "worker not found", success: false };
      }

      // update worker gender
      const updateWorkerGender =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            gender,
          }
        );
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updateWorkerGender,
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
      const { worker, phone } = req.body;
      // check if the phone number is equal to the one in the database
      const user = await workerProfileVerificationModel.findOne({ worker });

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
        { worker },
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
      const { worker, phone, code } = req.body;
      // Find the user

      // check if the phone number is equal to the one in the database
      const user = await workerProfileVerificationModel.findOne({ worker });

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
        { worker },
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
