const WorkerService = require("../services/worker.service");

class WorkerController {
  getWorkerProfile = async (req, res, next) => {
    const { status, ...responseData } = await WorkerService.findWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };
}

module.exports = new WorkerController();
