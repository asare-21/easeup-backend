const log = require("npmlog");
const { workerModel } = require("../models/worker_models");
class WorkerProfileService {
  // get worker
  async findWorker(req, res) {
    try {
    
      return {
        msg: "Worker Profile",
        status: 200,
        success: true,
        date: result,
      };
    } catch (e) {
      log.warn(e.message);
      console.log(e);
      return { status: 500, msg: e.message, success: false };
    }
  }
}

module.exports = new WorkerProfileService();
