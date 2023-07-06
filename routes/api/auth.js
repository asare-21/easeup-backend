const express = require("express");
const passport = require("passport");
const { generateToken } = require("../../passport/common");
const router = express.Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = generateToken(user);

    // Redirect or send response with the token
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

module.exports = router;
