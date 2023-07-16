const passport = require("passport");
const config = require("../config/config");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const { workerModel } = require("../models/worker_models");
const { workerProfileVerificationModel } = require("../models/worker_profile_verification_model");
const { workerProfileModel } = require("../models/worker_profile_model");

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
                let user = await workerModel.findOne({
                    email: profile.email,
                });
                if (!user) {
                    user = await workerModel.create({
                        email: profile.email,
                        name: profile.displayName,
                        last_login: Date.now(),
                        token: accessToken, // this key is used to send notification to the user.
                        googleId: profile.id,
                        profile_name: profile.displayName,
                    });
                    await createUser(user._id, profile.displayName);
                } else if (user && !user.facebookId) {
                    user = await workerModel.findByIdAndUpdate(user._id, {
                        last_login: Date.now(),
                        token: accessToken,
                        googleId: profile.id,
                    }, { new: true });
                    console.log("user found ", user)
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
                let user = await workerModel.findOne({
                    email: profile.emails[0].value,
                });
                if (!user) {
                    user = await workerModel.create({
                        name: profile.displayName,
                        last_login: Date.now(),
                        email: profile.emails[0].value,
                        token: accessToken,
                        facebookId: profile.id,
                        profile_name: profile.displayName,
                    });
                    await createUser(user._id, profile.displayName);
                } else if (user && !user.facebookId) {
                    user = await workerModel.findByIdAndUpdate(user._id, {
                        last_login: Date.now(),
                        token: accessToken,
                        facebookId: profile.id,
                    }, { new: true });
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
                let user = await workerModel.findOne({
                    email: profile.emails[0].value,
                });
                if (!user) {
                    user = await workerModel.create({
                        name: profile.displayName,
                        last_login: Date.now(),
                        token: accessToken,
                        twitterId: profile.id,
                        profile_name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await createUser(user._id, profile.displayName);
                } else if (user && !user.twitterId) {
                    user = await workerModel.findByIdAndUpdate(user._id, {
                        last_login: Date.now(),
                        token: accessToken,
                        twitterId: profile.id,
                    }, { new: true });
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

async function createUser(worker, profile_name) {
    const workerProfile = new workerProfileModel({
        worker,
        name: profile_name,
    });
    const workerVerification = new workerProfileVerificationModel({
        worker,
    });

    return await Promise.all([workerProfile.save(), workerVerification.save()]);



}