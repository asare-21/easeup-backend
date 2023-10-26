require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const { connect } = require("mongoose");
const rateLimit = require("express-rate-limit");
const { userRoute } = require("./routes/api/user.router");
const { searchRoute } = require("./routes/api/searchRoute");
const {
  workerProfileVerificationRoute,
} = require("./routes/api/workerProfileVerify.router");
const { workerRoute } = require("./routes/api/worker.router");
const { bookmarkRoute } = require("./routes/api/bookmarkRoute");
const log = require("npmlog");
const serviceAccount = require("./easeup.json");
const FBadmin = require("firebase-admin");
const compression = require("compression");
const helmet = require("helmet");
const { chatRoute } = require("./routes/api/chat");
const { chatRoomModel } = require("./models/chatRoomModel");
const { chatModel } = require("./models/chat_message_model");
const { workerModel } = require("./models/worker_models");
const { userModel } = require("./models/user_model");
const { dashboard } = require("./routes/dashboard/dashboard");
const { jobPlanRoute } = require("./routes/api/job_plan_route");
const authRoutes = require("./routes/api/auth");
const { jobs } = require("./routes/api/jobs");
const { introRoute } = require("./routes/api/intro_route");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max requests per windowMs
  message: 'Too many requests, please try again later.',
});
const session = require("express-session");
const swaggerUI = require('swagger-ui-express')
const swaggerJdDoc = require("swagger-jsdoc")
const passport = require("passport");
require("./passport/passport");
const cors = require("cors");
const { subscribeRoute } = require("./routes/api/subscribe");
const { recommendationRoute } = require("./routes/api/recommendation");
const { servicesModel } = require("./models/services_model");
const { servicesRoute } = require("./routes/api/services");
const { jobRequestRoute } = require("./routes/api/job_requests_route");
const { advertRoute } = require("./routes/api/advert_route");

const { workerProfileRoute } = require("./routes/api/workerProfile.router");


//options object for swaggerjs
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Easeup',
      version: '1.0.0',
      description: "The ultimate mobile app that revolutionizes how you book handyman services effortlessly.",
    },
    servers: [
      {
        //update to production url
        url: 'localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJdDoc(options)
const { timeslotRoute } = require("./routes/api/timeslot");
// const { keyModel } = require("./models/key_model");
const { keysRoute } = require("./routes/api/keys_route");
const { azureAIRouter } = require("./routes/api/azure_ai_route");
const { redisClient } = require("./cache/user_cache");

//Auth
app.use(
  session({
    secret: process.env.JWT_SECRET,
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(cors());
app.use(compression());
app.use(helmet());
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(limiter);
app.use("/auth", authRoutes);
app.use("/user", userRoute);
app.use("/search", searchRoute);
app.use("/bookmark", bookmarkRoute);
app.use("/verify-worker-profile", workerProfileVerificationRoute);
app.use("/worker", workerRoute);
app.use("/worker-profile", workerProfileRoute);
app.use("/room", chatRoute);
app.use("/jobs", jobs);
app.use("/subscribe", subscribeRoute);
app.use("/recommend", recommendationRoute);
app.use("/jplan", jobPlanRoute);
app.use("/dashboard", dashboard);
app.use("/services", servicesRoute)
app.use("/j-requests", jobRequestRoute)
app.use("/adverts", advertRoute)
app.use("/intro", introRoute)
app.use("/timeslot", timeslotRoute)
app.use("/keys", keysRoute)
app.use("/azure-ai", azureAIRouter)
// add a route for testing to know if API is live
app.get("/", (req, res) => {
  res.status(200).json({

    status: 200,
    success: true,
  });
});

// only available in development
if (process.env.NODE_ENV === "development") {
  // setting up swagger doc
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))
}

// handle 404
app.use((req, res, next) => {
  return res.status(404).json({
    msg: "Undefined route",
    status: 404,
    success: false,
    path: req.path,
  });
});


// enforce https
app.use(function (req, res, next) {
  if (process.env.NODE_ENV != "development" && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// Starting the server
http.listen(PORT, async () => {
  try {
    await Promise.all([
      FBadmin.initializeApp({
        credential: FBadmin.credential.cert(serviceAccount),
      }),
      connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@easeup-cluster.pfxvast.mongodb.net/?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          dbName: "easeup",

        }
      ),
      redisClient.connect()
    ])
    console.log("Connected to MongoDB");

  } catch (err) {
    console.error(err);

  }
});


module.exports.admin = FBadmin;

