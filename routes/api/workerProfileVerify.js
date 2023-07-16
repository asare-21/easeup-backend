const router = require("express").Router();
const {
  workerProfileVerificationModel,
} = require("../../models/worker_profile_verification_model");
const { notificationModel } = require("../../models/nofications");
const admin = require("firebase-admin");
const log = require("npmlog");
const otpGenerator = require("otp-generator");
const axios = require("axios");
const { workerVerifyJWT } = require("../../passport/common_worker");
const { commonError, returnUnAuthUserError } = require("../api/user_route");
const { workerProfileModel } = require("../../models/worker_profile_model");
const { cache } = require("../../cache/user_cache");
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
} = require("../../validators/workerProfileVerify.validator");
// worker profile verification data
router.get("/:worker", workerVerifyJWT, async (req, res) => {
  const { worker } = req.params;
  // check if user is authenticated
  try {
    // check if worker is valid
    workerProfileVerificationModel.findOne({ worker }, (err, worker) => {
      if (err) {
        return commonError(res, err.message);
      }
      return res.status(200).json({
        msg: "Worker Profile",
        status: 200,
        success: true,
        worker,
      });
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// update selfie
router.post("/update/image", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerProfileImageValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, selfie } = req.body;
    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        selfie,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res
            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        workerProfileModel.findOneAndUpdate(
          {
            worker,
          },
          {
            profile_url: selfie,
          },
          (err, result) => {
            if (err) {
              log.warn(err.message);
              return res
                .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
            }
            cache.del(`worker-profile/${worker}`);
            return res.status(200).json({
              msg: "Profile updated",
              status: 200,
              success: true,
              user,
            });
          }
        );
        // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
//accepts url of front and back of ghana card
// update ghc front
// update ghc back
router.post("/update/ghc-images", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerGhImagesValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, gh_card_image_back, gh_card_image_front, gh_card_to_face } =
      req.body;

    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        gh_card_to_face,
        gh_card_image_front,
        gh_card_image_back,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res
            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// update age doc
router.post("/update/age-verify", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerAgeValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, age_doc } = req.body;
    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        age_verification_document: age_doc,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res

            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// update proof of skill
router.post("/update/pos", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerProofOfSkillValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, proof_skill } = req.body;

    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        proof_skill,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res

            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// insurance
router.post("/update/insurance", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerInsuranceValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, insurance_doc } = req.body;

    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        insurance_document: insurance_doc,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res

            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);

      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// update address
router.post("/update/address", workerVerifyJWT, async (req, res) => {
  try {
    // required field : user_id
    const validationResults = await updateWorkerAddressValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, address, latlng } = req.body;

    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        address: {
          address,
          latlng,
        },
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res

            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);

      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// update gender
router.post("/update/gender", workerVerifyJWT, async (req, res) => {
  try {
    // required field : worker
    const validationResults = await updateWorkerGenderValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, gender } = req.body;

    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        gender,
      },
      (err, user) => {
        if (err) {
          log.warn(err.message);
          return res

            .json({ msg: err.message, status: 500, success: false }); // Internal Server Error
        }
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        return res.status(200).json({
          msg: "Profile updated",
          status: 200,
          success: true,
          user,
        }); // User Found and returned
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);

      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// send verifcatioin code
router.post("/phone/send-code", workerVerifyJWT, async (req, res) => {
  //
  try {
    // required field : user_id
    const validationResults = await updateWorkerPhoneValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, phone } = req.body;
    // check if the phone number is equal to the one in the database
    const user = await workerProfileVerificationModel.findOne({ worker });
    if (user.phone.toString() === phone.toString())
      return res.status(400).json({
        msg: "Sorry. Operation not allowed",
        status: 400,
        success: false,
      }); // At least one field is required

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
      return res.json({
        msg: "Handshake error. Access Denied",
        status: 500,
        success: false,
      }); // Internal Server Error
    // Find the user
    workerProfileVerificationModel.findOneAndUpdate(
      { worker },
      {
        code: code,
      },
      async (err, user) => {
        if (err)
          return res.json({
            msg: "Internal Server Error",
            status: 500,
            success: false,
          }); // Internal Server Error
        if (!user)
          return res
            .status(404)
            .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
        // Update the user
        return res.status(200).json({
          msg: `Verification code has been sent to ${phone}`,
          status: 200,
          success: true,
        }); // User Updated
      }
    );
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});
// update phone
router.post("/phone/verify-code", workerVerifyJWT, async (req, res) => {
  //
  try {
    // required field : user_id
    const validationResults = await updateWorkerPhoneVerifyCodeValidator(req.body);

    if (validationResults.status !== 200) {
      return res.status(400).json({
        msg: "Bad Request. Missing fields",
        status: 400,
        success: false,
        validationResults: validationResults.msg
      });
    }
    const { worker, phone, code } = req.body;
    // Find the user
    workerProfileVerificationModel.findOne({ worker }, async (err, user) => {
      if (err)
        return res

          .json({ msg: "Internal Server Error", status: 500, success: false }); // Internal Server Error
      if (!user)
        return res
          .status(404)
          .json({ msg: "User Not Found", status: 404, success: false }); // User Not Found
      // Check if code matches
      if (user.code.toString() !== code.toString())
        return res.status(400).json({
          msg: "Verification code is incorrect",
          status: 400,
          success: false,
        }); // Verification code is incorrect
      // Update the user if code matched
      await workerProfileVerificationModel.findOneAndUpdate(
        { worker },
        { code: "", phone }
      );
      return res.status(200).json({
        msg: `Code has been verified successfully.`,
        status: 200,
        success: true,
      }); // User Updated
    });
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);
      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
});

// module.exports.workerProfileVerificationRoute = router;
