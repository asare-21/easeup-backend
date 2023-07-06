const passport = require("passport");
const config = require("../config/config");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { userModel } = require("../models/user_model");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqtoCallback: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      // Store the user information in a database or in a session.
      const userExist = await userModel.findOne({ email: profile.email });
      let user;
      if (!userExist) {
        user = await userModel.create({
          displayName: profile.displayName,
          email: profile.email,
          image_url: profile.picture,
        });
      }
      console.log(userExist);
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
