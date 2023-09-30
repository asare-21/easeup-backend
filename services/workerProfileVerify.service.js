const log = require("npmlog");
const otpGenerator = require("otp-generator");
const { redisClient } = require("../cache/user_cache");
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
const { workerModel } = require("../models/worker_models");
const cron = require('node-cron');

class WorkerProfileVerificationService {
  // worker profile verification data
  async findWorkerProfileVerification(req, res) {
    try {
      const worker = req.user.id;
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

      const { selfie } = req.body;
      const worker = req.user.id;

      // Update the worker
      const response = await Promise.all([
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
      if (!response[0] || !response[1]) return { status: 404, msg: "worker not found", success: false };

      await redisClient.del(`worker-profile/${worker}`);
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

        gh_card_image_back,
        gh_card_image_front,
        gh_card_to_face,
        ghc_exp,
        ghc_number
      } = req.body;

      const worker = req.user.id;

      // update worker
      const updatedWorker =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            gh_card_to_face,
            gh_card_image_front,
            gh_card_image_back,
            ghc_exp,
            ghc_number
          }
        );

      if (!updatedWorker) {
        return { status: 404, msg: "worker not found", success: false };
      }

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
      const { age_doc } = req.body;

      const worker = req.user.id;

      // Find the user
      const updatedWorkerAge =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            age_verification_document: age_doc,
          }
        );
      if (!updatedWorkerAge) {
        return { status: 404, msg: "worker not found", success: false };
      }
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
      const { proof_skill } = req.body;

      const worker = req.user.id;

      // Update worker proof of skill
      const updatedWorkerPos =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            proof_skill,
          }
        );
      if (!updatedWorkerPos) {
        return { status: 404, msg: "worker not found", success: false };
      }
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
      const { insurance_doc } = req.body;

      const worker = req.user.id;


      // Update worker insurance
      const updatedWorkerInsurance =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            insurance_document: insurance_doc,
          }
        );
      if (!updatedWorkerInsurance) {
        return { status: 404, msg: "worker not found", success: false };
      }
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




      // update address


      const updatedAddress =
        await Promise.all([workerProfileVerificationModel.findOneAndUpdate(
          { worker: req.user.id },
          {
            address: {
              type: "Point",
              coordinates: latlng,
            },
          },
          { new: true }

        ), workerProfileModel.findOneAndUpdate({ worker: req.user.id },
          {
            work_radius: {
              type: "Point",
              coordinates:
                latlng,
            }
          },
          { new: true }
        )])

      console.info(updatedAddress[0], updatedAddress[1])

      if (!updatedAddress[0] || !updatedAddress[1]) {
        return { status: 404, msg: "worker not found", success: false };
      }

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
      const { gender } = req.body;

      const worker = req.user.id;



      // update worker gender
      const updateWorkerGender =
        await workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          {
            gender,
          }
        );
      if (!updateWorkerGender) {
        return { status: 404, msg: "worker not found", success: false };
      }
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
      const { phone } = req.body;
      const worker = req.user.id;
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
      const { phone, code } = req.body;
      const worker = req.user.id;
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
      await Promise.all([
        redisClient.del(`worker-profile/${worker}`),
        redisClient.del(`worker/${worker}`),
        workerModel.findOneAndUpdate({ _id: worker }, {
          phone
        }),
        workerProfileVerificationModel.findOneAndUpdate(
          { worker },
          { code: "", phone }
        )

      ])

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

// wrtie a cron job to update workerModel with data from workerverificationmodel
// cron job runs every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    // Fetch data from workerProfileVerificationModel
    const verificationData = await workerProfileVerificationModel.find({});

    // Update workerModel with the fetched data
    verificationData.forEach(async (verification) => {
      const { worker, ...updateData } = verification._doc;
      delete updateData._id
      await workerModel.updateOne({ _id: worker }, { $set: updateData });
    });

    log.info("Cron job completed succcessfully.")
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});

module.exports = new WorkerProfileVerificationService();
