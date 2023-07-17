const { cache } = require("./cache/user_cache");
const { userModel } = require("./models/user_model");
const { notificationModel } = require("./models/nofications");
const { workerModel } = require("./models/worker_models");
const { workerProfileModel } = require("./models/worker_profile_model");
const { mediaModel } = require("./models/mediaModel");
const log = require("npmlog");
const admin = require("firebase-admin");

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

async function createNotification(user_id, title, body, type, token) {
  try {
    // required field : user_id

    if (!user_id) return { msg: "Bad Request", status: 400, success: false }; // User ID is required
    //check firebase if uid exists

    // Find the user
    const user = userModel.findById(user_id);
    if (!user) return log.warn("User Not Found"); // User Not Found
    // Create the notification
    const notification = new notificationModel({
      user: user_id,
      title: title,
      message: body,
      type: type,
    });
    await notification.save();
    // Use token to send a notification to the user
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };
    await admin.messaging().send(message);
    log.info("Notification sent to the user");
    return log.info("Notification created");
  } catch (e) {
    if (e.errorInfo) {
      // User Not Found
      log.warn(e.message);

      return returnUnAuthUserError(res, e.message);
    }
    return commonError(res, e.message);
  }
}

//export
module.exports.getAndCacheUsers = getAndCacheUsers;
module.exports.getAndCacheWorkers = getAndCacheWorkers;
module.exports.getAndCacheWorkerProfiles = getAndCacheWorkerProfiles;
module.exports.getAndCacheWorkerMedia = getAndCacheWorkerMedia;
module.exports.returnUnAuthUserError = returnUnAuthUserError;
module.exports.createNotification = createNotification;
module.exports.commonError = commonError;
