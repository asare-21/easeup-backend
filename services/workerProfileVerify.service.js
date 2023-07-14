const log = require("npmlog");
const { cache } = require("../cache/user_cache");
const {
  workerProfileVerificationModel,
} = require("../models/worker_profile_verification_model");
const { workerProfileModel } = require("../models/worker_profile_model");

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
        return res.status(400).json({
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        });
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
      const updatedWorkerSelfie = await workerProfileModel.findOneAndUpdate(
        {
          worker,
        },
        {
          profile_url: selfie,
        }
      );
      cache.del(`worker-profile/${worker}`);
      return {
        msg: "Profile updated",
        status: 200,
        success: true,
        data: updatedWorkerSelfie,
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
      // required field : user_id
      const validationResults = await updateWorkerGhImagesValidator(req.body);

      if (validationResults.status !== 200) {
        return res.status(400).json({
          msg: "Bad Request. Missing fields",
          status: 400,
          success: false,
          validationResults: validationResults.msg,
        });
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
}

module.exports = new WorkerProfileVerificationService();
