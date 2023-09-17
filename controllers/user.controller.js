const UserService = require("../services/user.service");

class UserController {
  deleteUser = async (req, res, next) => {
    const { status, ...responseData } = await UserService.deleteUser(req, res);
    res.status(status).send(responseData);
  };

  getUserProfile = async (req, res, next) => {
    const { status, ...responseData } = await UserService.getUserProfile(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateImage = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateImage(req, res);
    res.status(status).send(responseData);
  };

  updateAddress = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateAddress(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateGender = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateGender(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateToken = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateToken(req, res);
    res.status(status).send(responseData);
  };

  updatePhone = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updatePhone(req, res);
    res.status(status).send(responseData);
  };

  updateGhanaCard = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateGhanaCard(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updateInfo = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updateUser(req, res);
    res.status(status).send(responseData);
  };

  updatePhoneSendCode = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updatePhoneSendCode(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  updatePhoneVerifyCode = async (req, res, next) => {
    const { status, ...responseData } = await UserService.updatePhoneVerifyCode(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  createUser = async (req, res, next) => {
    const { status, ...responseData } = await UserService.createUser(req, res);
    res.status(status).send(responseData);
  };

  loginUser = async (req, res, next) => {
    const { status, ...responseData } = await UserService.userLogin(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  getUserNotifications = async (req, res, next) => {
    const { status, ...responseData } = await UserService.getNotifications(
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
    const { status, ...responseData } = await UserService.getBookmarks(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  deleteBookmarks = async (req, res, next) => {
    const { status, ...responseData } = await UserService.deleteBookmark(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  resetPassword = async (req, res, next) => {
    const { status, ...responseData } = await UserService.resetPassword(
      req,
      res
    );
    res.status(status).send(responseData);
  };

  sendResetPasswordCode = async (req, res, next) => {
    const { status, ...responseData } = await UserService.sendResetCode(
      req,
      res
    );
    res.status(status).send(responseData);
  };
}

module.exports = new UserController();
