const { cache } = require("./cache/user_cache");
const { userModel } = require("./models/user_model");
const { workerModel } = require("./models/worker_models");
const { workerProfileModel } = require("./models/worker_profile_model");
const { mediaModel } = require("./models/mediaModel");

async function getAndCacheUsers() {
  console.log("getting users");
  userModel.find((err, docs) => {
    if (err) {
      console.log(err);
    }
    if (docs) {
      docs.forEach((doc) => {
        console.log("user ", doc._id, doc.profile_name);

        cache.set(`user/${doc._id}`, doc);
      });
    }
  });
}

async function getAndCacheWorkers() {
  console.log("getting workers");
  workerModel.find((err, docs) => {
    if (err) {
      console.log(err);
    }
    if (docs) {
      docs.forEach((doc) => {
        console.log("worker ", doc._id, doc.worker);

        cache.set(`worker/${doc._id}`, doc);
      });
    }
  });
}

async function getAndCacheWorkerProfiles() {
  console.log("getting worker profiles");

  workerProfileModel.find((err, docs) => {
    if (err) {
      console.log(err);
    }
    if (docs) {
      docs.forEach((doc) => {
        console.log("worker profile ", doc.name, doc.worker);
        cache.set(`worker-profile/${doc.worker}`, JSON.stringify(doc));
      });
    }
  });
}

async function getAndCacheWorkerMedia() {
  console.log("getting worker media");

  mediaModel.find((err, docs) => {
    if (err) {
      console.log(err);
    }
    if (docs) {
      docs.forEach((doc) => {
        console.log("worker profile media", doc._id, doc.worker);

        cache.set(`portfolio/${doc.worker}`, JSON.stringify(doc));
      });
    }
  });
}

async function returnUnAuthUserError(res, msg) {
  return { msg: msg, status: 401, success: false };
}

async function commonError(res, msg) {
  return { msg, status: 500, success: false };
}

//export
module.exports.getAndCacheUsers = getAndCacheUsers;
module.exports.getAndCacheWorkers = getAndCacheWorkers;
module.exports.getAndCacheWorkerProfiles = getAndCacheWorkerProfiles;
module.exports.getAndCacheWorkerMedia = getAndCacheWorkerMedia;
module.exports.returnUnAuthUserError = returnUnAuthUserError;
module.exports.commonError = commonError;
