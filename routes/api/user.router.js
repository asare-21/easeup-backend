const router = require("express").Router();
const userController = require("../../controllers/user.controller");
const { verifyJWT } = require("../../passport/common");

router.post("/", userController.createUser);

router.get("/:userId", verifyJWT, userController.getUserProfile);

router.patch("/:userId", verifyJWT, userController.updateUser);

router.delete("/:userId", verifyJWT, userController.deleteUser);

router.post(
  "/:userId/phone/send-code",
  verifyJWT,
  userController.updatePhoneSendCode
);

router.post(
  "/:userId/phone/verify-code",
  verifyJWT,
  userController.updatePhoneVerifyCode
);

router.get(
  "/:userId/notifications",
  verifyJWT,
  userController.getUserNotifications
);

router.patch(
  "/:userId/notifications/:notificationsId",
  verifyJWT,
  userController.updateUserNotifications
);

router.get("/:userId/bookmarks", verifyJWT, userController.getBookmarks);

router.delete(
  "/:userId/bookmarks/:bookmarkId",
  verifyJWT,
  userController.deleteBookmarks
);

module.exports.userRoute = router;
