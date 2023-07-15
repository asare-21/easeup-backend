const UserService = require("../services/worker.service");

class WorkerController {
  deleteUser = async (req, res, next) => {
    const { status, ...responseData } = await UserService.findWorker(req, res);
    res.status(status).send(responseData);
  };

  getUserProfile = async (req, res, next) => {
    const { status, ...responseData } = await UserService.removeWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateImage = async (req, res, next) => {
    const { status, ...responseData } = await UserService.getWorkerToken(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateAddress = async (req, res, next) => {
    const { status, ...responseData } = await UserService.createWorker(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateGender = async (req, res, next) => {
    const { status, ...responseData } = await UserService.saveWorkerLocation(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateToken = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateWorkerToken(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updatePhone = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateGhanaCard(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateGhanaCard = async (req, res, next) => {
    const { status, ...responseData } =
      await UserService.getWorkerNotifications(req, res);
    res.status(status).send(responseData);
  };

  updatePhoneSendCode = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updatePhoneVerifyCode = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  createUser = async (req, res, next) => {
    const { status, ...responseData } =
      await UserService.getWorkerNotifications(req, res);
    res.status(status).send(responseData);
  };

  getUserNotifications = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateUserNotifications = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  getBookmarks = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  deleteBookmarks= async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateNotifications(
      req,
      res
    );
    res.status(status).send(responseData);
  };
}

module.exports = new WorkerController();
