const { cache } = require("./cache/user_cache");
const { userModel } = require("./models/user_model");
const { notificationModel } = require("./models/nofications");
const { workerModel } = require("./models/worker_models");
const { workerProfileModel } = require("./models/worker_profile_model");
const { workerProfileVerificationModel } = require("./models/worker_profile_verification_model")
const { mediaModel } = require("./models/mediaModel");
const log = require("npmlog");
const admin = require("firebase-admin");
const crypto = require("crypto");

async function getAndCacheUsers() {
  try {
    const docs = await userModel.find();
    if (docs) {
      docs.forEach((doc) => {
        cache.set(`user/${doc._id}`, doc);
      });
      log.info(`Cached ${docs.length} users`);
    }
  } catch (err) {
    log.error("Error caching users:", err);
  }
}

async function getAndCacheWorkers() {
  try {
    const docs = await workerModel.find();
    if (docs) {
      docs.forEach((doc) => {
        cache.set(`worker/${doc._id}`, doc);
      });
      log.info(`Cached ${docs.length} workers`);
    }
  } catch (err) {
    log.error("Error caching workers:", err);
  }
}

async function getAndCacheWorkerProfiles() {
  try {
    const docs = await workerProfileModel.find();
    if (docs) {
      docs.forEach((doc) => {
        cache.set(`worker-profile/${doc.worker}`, JSON.stringify(doc));
      });
      log.info(`Cached ${docs.length} worker profiles`);
    }
  } catch (err) {
    log.error("Error caching worker profiles:", err);
  }
}

async function getAndCacheWorkerMedia() {
  try {
    const docs = await mediaModel.find();
    if (docs) {
      docs.forEach((doc) => {
        cache.set(`portfolio/${doc.worker}`, JSON.stringify(doc));
      });
      log.info(`Cached ${docs.length} worker media items`);
    }
  } catch (err) {
    log.error("Error caching worker media:", err);
  }
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
    if (!user_id) return { msg: "Bad Request", status: 400, success: false };

    // Find the user
    const user = await userModel.findById(user_id);
    if (!user) {
      log.warn("User Not Found");
      return { msg: "User Not Found", status: 404, success: false };
    }

    // Create the notification
    const notification = new notificationModel({
      user: user_id,
      title: title,
      message: body,
      type: type,
    });

    // Use token to send a notification to the user
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };

    await Promise.all([
      admin.messaging().send(message),
      notification.save()
    ]);

    log.info("Notification created and sent to the user");
    return { msg: "Notification created", status: 200, success: true };
  } catch (e) {
    if (e.errorInfo) {
      log.warn(e.message);
      return { msg: e.message, status: 401, success: false };
    }
    log.error("Error creating notification:", e.message);
    return { msg: e.message, status: 500, success: false };
  }
}

//Function that generates Salt and Hash
function generatePassword(password) {
  const salt = crypto.randomBytes(64).toString("hex");
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
}

//Function that verifies userpassword with databse salt and hash
function isValidPassword(password, salt, hash) {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === hashVerify;
}

async function createWorkerProfileAndVerification(worker, profile_name) {
  const workerProfile = new workerProfileModel({
    worker,
    name: profile_name,
  });
  const workerVerification = new workerProfileVerificationModel({
    worker,
  });

  return await Promise.all([workerProfile.save(), workerVerification.save()]);
}

//export
module.exports.generatePassword = generatePassword;
module.exports.isValidPassword = isValidPassword;
module.exports.createWorkerProfileAndVerification =
  createWorkerProfileAndVerification;
module.exports.getAndCacheUsers = getAndCacheUsers;
module.exports.getAndCacheWorkers = getAndCacheWorkers;
module.exports.getAndCacheWorkerProfiles = getAndCacheWorkerProfiles;
module.exports.getAndCacheWorkerMedia = getAndCacheWorkerMedia;
module.exports.returnUnAuthUserError = returnUnAuthUserError;
module.exports.createNotification = createNotification;
module.exports.commonError = commonError;
