const { cache } = require("./cache/user_cache");
const { userModel } = require("./models/user_model");
const { workerModel } = require("./models/worker_models");
const { workerProfileModel } = require("./models/worker_profile_model");
const { mediaModel } = require("./models/mediaModel");

async function getAndCacheUsers() {
    console.log('getting users')
    userModel.find((err, docs) => {
        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.forEach(doc => {
                cache.set(`user/${doc._id}`, doc)
            })
        }
    })
}

async function getAndCacheWorkers() {
    console.log('getting workers')
    workerModel.find((err, docs) => {
        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.forEach(doc => {
                cache.set(`worker/${doc._id}`, doc)
            })
        }
    })
}

async function getAndCacheWorkerProfiles() {
    console.log('getting worker profiles')

    workerProfileModel.find((err, docs) => {
        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.forEach(doc => {
                console.log(doc)
                cache.set(`worker-profile/${doc.worker}`, JSON.stringify(doc))
            })
        }
    })
}

async function getAndCacheWorkerMedia() {
    console.log('getting worker media')

    mediaModel.find((err, docs) => {
        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.forEach(doc => {
                cache.set(`portfolio/${doc.worker}`, JSON.stringify(doc))
            })
        }
    })
}



//export
module.exports.getAndCacheUsers = getAndCacheUsers;
module.exports.getAndCacheWorkers = getAndCacheWorkers;
module.exports.getAndCacheWorkerProfiles = getAndCacheWorkerProfiles;
module.exports.getAndCacheWorkerMedia = getAndCacheWorkerMedia;