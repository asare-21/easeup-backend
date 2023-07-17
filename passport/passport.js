const passport = require("passport");
const config = require("../config/config");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const { userModel } = require("../models/user_model");
const { createNotification } = require("../utils");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callBackUrl,
      passReqtoCallback: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // check if user exist with the profile id
        let user = await userModel.findOne({
          email: profile.email,
        });

        // store user in database if user does not exist
        if (!user) {
          user = await userModel.create({
            email: profile.email,
            displayName: profile.displayName,
            last_login: Date.now(),
            token: accessToken, // this key is used to send notification to the user.
            googleId: profile.id,
            profile_name: profile.displayName,
          });
          console.log("user not found", user);
          // create notification
          await createNotification(
            user._id,
            "Welcome to Easeup",
            "We're glad to have you on board. Enjoy your stay",
            "welcome",
            user.token
          );
          // send notification to update user profile
          await createNotification(
            user._id,
            "Update your profile",
            "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
            "update_profile",
            user.token
          );
        } else if (user && !user.facebookId) {
          user = await userModel.findByIdAndUpdate(
            user._id,
            {
              last_login: Date.now(),
              token: accessToken,
              googleId: profile.id,
            },
            { new: true }
          );
          console.log("user found ", user);
        }
        return cb(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callBackUrl,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // check if user exist with the profile id
        let user = await userModel.findOne({
          email: profile.emails[0].value,
        });
        // store user in database if user does not exist
        if (!user) {
          user = await userModel.create({
            displayName: profile.displayName,
            last_login: Date.now(),
            email: profile.emails[0].value,
            token: accessToken,
            facebookId: profile.id,
            profile_name: profile.displayName,
          });

          // create notification
          await createNotification(
            user._id,
            "Welcome to Easeup",
            "We're glad to have you on board. Enjoy your stay",
            "welcome",
            user.token
          );
          // send notification to update user profile
          await createNotification(
            user._id,
            "Update your profile",
            "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
            "update_profile",
            user.token
          );
        } else if (user && !user.facebookId) {
          user = await userModel.findByIdAndUpdate(
            user._id,
            {
              last_login: Date.now(),
              token: accessToken,
              facebookId: profile.id,
            },
            { new: true }
          );
        }

        return cb(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: config.twitter.callBackUrl,
      includeEmail: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // check if user exist with the profile id
        let user = await userModel.findOne({
          email: profile.emails[0].value,
        });

        // store user in database if user does not exist
        if (!user) {
          user = await userModel.create({
            displayName: profile.displayName,
            last_login: Date.now(),
            token: accessToken,
            twitterId: profile.id,
            profile_name: profile.displayName,
            email: profile.emails[0].value,
          });
          // create notification
          await createNotification(
            user._id,
            "Welcome to Easeup",
            "We're glad to have you on board. Enjoy your stay",
            "welcome",
            user.token
          );
          // send notification to update user profile
          await createNotification(
            user._id,
            "Update your profile",
            "We noticed you haven't updated your profile. Please update your profile to enjoy the full experience",
            "update_profile",
            user.token
          );
        } else if (user && !user.twitterId) {
          user = await userModel.findByIdAndUpdate(
            user._id,
            {
              last_login: Date.now(),
              token: accessToken,
              twitterId: profile.id,
            },
            { new: true }
          );
        }
        return cb(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
