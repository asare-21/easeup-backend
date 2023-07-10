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
    res.redirect(`${process.env.GOOGLE_CALLBACK_URL}/?token=${token}`);
  }
);

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = generateToken(user);

    // Redirect or send response with the token
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(`${process.env.FACEBOOK_CALLBACK_URL}/?token=${token}`);
  }
);

router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);

    // Redirect or send response with the token
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(`${process.env.TWITTER_CALLBACK_URL}/?token=${token}`);
  }
);

module.exports = router;
