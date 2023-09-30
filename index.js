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
const { advertModel } = require("./models/advert_model");
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
const { keyModel } = require("./models/key_model");
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
app.enable("trust proxy");
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
    msg: "Welcome to Easeup API. Testing",
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
    log.info(`Listening on port ${PORT}`);
    // Environment variables for cache

    await redisClient.connect()
    await connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@easeup-cluster.pfxvast.mongodb.net/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "easeup",
      }
    );
    await FBadmin.initializeApp({
      credential: FBadmin.credential.cert(serviceAccount),
    });
    await saveKeys()
    log.info("Connected to MongoDB and running");

  } catch (err) {
    console.error(err);
  }
});

// // /////////////////////// Socket.io
// io.on("connection", (socket) => {
//   console.log("a user connected");
//   socket.on("disconnected", (msg) => {
//     console.log("message: ", msg);
//   });

//   socket.on("connected", (msg) => {
//     console.log("message: ", msg);
//   });

//   // create chat room
//   socket.on("new-room", async (room) => {
//     /**
//      * new room structure
//      * {
//      * room,
//      * worker,
//      * user
//      * }
//      */
//     await createNewRoom(room);
//     console.log("room created");
//   });

//   // join room
//   socket.on("join-room", async (chat) => {
//     socket.join(chat.room); // add socket to room
//     const clients = io.sockets.adapter.rooms[chat.room];
//     console.log("rooms ", io.sockets.adapter.rooms);
//     if (!clients) {
//       console.log(`No clients in room: ${chat.room}`);
//       return;
//     }
//     const clientIds = Object.keys(clients.sockets);
//     console.log(`Clients in room '${chat.room}':`, clientIds);
//     console.log(`Room data sent'${chat.room}':`, chat);
//   });
//   socket.on("message", async (chat) => {
//     // io.to(chat.room).emit('message', chat); // broadcast message to all users except sender
//     socket.broadcast.to(chat.room).emit("message", chat);
//     const worker = await workerModel.findOne({ _id: chat.worker });
//     const user = await workerModel.findOne({ _id: chat.user });
//     // send notification to user or worker
//     await admin.messaging().send({
//       notification: {
//         title: "New Message",
//         body: chat.message,
//       },
//       data: {
//         room: chat.room,
//         user: chat.user,
//         worker: chat.worker,
//         from: chat.from,
//         message: chat.message,
//         media: chat.media,
//       },
//       token: chat.from === chat.user ? worker.deviceToken : user.deviceToken,
//     });

//     await saveChat(chat);
//   });
// });
// // Save chat to database
// async function saveChat(chat) {
//   const { room, user, message, from, worker, media } = chat;
//   const newChat = new chatModel({
//     room,
//     user,
//     message,
//     from,
//     worker,
//     media,
//   });
//   try {
//     // emit message to user
//     console.log("message sent from", from);
//     console.log("message sent to", from === user ? worker : user);
//     // io.to(room).emit(from === user ? user : worker, chat)
//     // emit mesaage to user before saving to database
//     await newChat.save();
//   } catch (err) {
//     console.log(err);
//     io.emit(room, " Error saving message");
//   }
// }

// // Create a new room
// async function createNewRoom(_room) {
//   const { room, worker, user, userName, userPhoto, workerName, workerPhoto } =
//     _room;
//   const newRoom = new chatRoomModel({
//     room,
//     worker,
//     user,
//     userName,
//     userPhoto,
//     workerName,
//     workerPhoto,
//   });
//   try {
//     chatRoomModel.findOne(
//       {
//         room,
//         worker,
//         user,
//       },
//       async (err, doc) => {
//         if (err) {
//           console.log(err);
//         }
//         if (doc) {
//           console.log("room already exists");
//           io.emit(user, "Room already exists");
//         } else {
//           await newRoom.save();
//           await userModel.findOneAndUpdate(
//             { _id: user },
//             { $push: { rooms: room } }
//           );
//           await workerModel.findOneAndUpdate(
//             { _id: worker },
//             { $push: { rooms: room } }
//           );

//           io.emit(user, "Room created");
//           console.log("room created");
//         }
//       }
//     );
//   } catch (e) {
//     console.log("Something went room ", e);
//   }
// }

async function saveKeys() {
  // await keyModel.create({
  //   title: "sk_live",
  //   key: "sk_test_9d35509c32d93084950c94010e4bbbcc13996520"
  // })
  // await keyModel.create({
  //   title: "sk_test",
  //   key: "sk_test_9d35509c32d93084950c94010e4bbbcc13996520"
  // })

  // await keyModel.create({
  //   title: "live_paystack",
  //   key: "sk_live_2cfdeeefd1e204d612700b937f6002a808d022d0"
  // })
}


module.exports.admin = FBadmin;

