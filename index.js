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
const { userRoute } = require("./routes/user.router");
const { searchRoute } = require("./routes/api/searchRoute");
const {
  workerProfileVerificationRoute,
} = require("./routes/workerProfileVerify.router");
const { workerRoute } = require("./routes/worker.router");
const { workerProfileRoute } = require("./routes/workerProfile");
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
const limiter = rateLimit({
  windowMs: 600000, //
  max: 10000,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  message: {
    msg: "Too many requests from this IP, please try again later",
    status: 429,
    success: false,
    limit: true,
  },
  onLimitReached: (req, res, options) => {
    log.warn(`Rate limit reached for IP: ${req.ip}`);
    return res
      .status(429)
      .json({
        msg: "Too many requests from this IP, please try again later",
        status: 429,
        success: false,
        limit: true,
      });
  },
});

const session = require("express-session");
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
const { authWorker } = require("./routes/api/auth_work");

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
app.use("/auth-worker", authWorker);
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
    // migrate()
    log.info("Connected to MongoDB and running");
  } catch (err) {
    console.error(err);
  }
});

// /////////////////////// Socket.io
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnected", (msg) => {
    console.log("message: ", msg);
  });

  socket.on("connected", (msg) => {
    console.log("message: ", msg);
  });

  // create chat room
  socket.on("new-room", async (room) => {
    /**
     * new room structure
     * {
     * room,
     * worker,
     * user
     * }
     */
    await createNewRoom(room);
    console.log("room created");
  });

  // join room
  socket.on("join-room", async (chat) => {
    socket.join(chat.room); // add socket to room
    const clients = io.sockets.adapter.rooms[chat.room];
    console.log("rooms ", io.sockets.adapter.rooms);
    if (!clients) {
      console.log(`No clients in room: ${chat.room}`);
      return;
    }
    const clientIds = Object.keys(clients.sockets);
    console.log(`Clients in room '${chat.room}':`, clientIds);
    console.log(`Room data sent'${chat.room}':`, chat);
  });
  socket.on("message", async (chat) => {
    // io.to(chat.room).emit('message', chat); // broadcast message to all users except sender
    socket.broadcast.to(chat.room).emit("message", chat);
    const worker = await workerModel.findOne({ _id: chat.worker });
    const user = await workerModel.findOne({ _id: chat.user });
    // send notification to user or worker
    await admin.messaging().send({
      notification: {
        title: "New Message",
        body: chat.message,
      },
      data: {
        room: chat.room,
        user: chat.user,
        worker: chat.worker,
        from: chat.from,
        message: chat.message,
        media: chat.media,
      },
      token: chat.from === chat.user ? worker.token : user.token,
    });

    await saveChat(chat);
  });
});
// Save chat to database
async function saveChat(chat) {
  const { room, user, message, from, worker, media } = chat;
  const newChat = new chatModel({
    room,
    user,
    message,
    from,
    worker,
    media,
  });
  try {
    // emit message to user
    console.log("message sent from", from);
    console.log("message sent to", from === user ? worker : user);
    // io.to(room).emit(from === user ? user : worker, chat)
    // emit mesaage to user before saving to database
    await newChat.save();
  } catch (err) {
    console.log(err);
    io.emit(room, " Error saving message");
  }
}

// Create a new room
async function createNewRoom(_room) {
  const { room, worker, user, userName, userPhoto, workerName, workerPhoto } =
    _room;
  const newRoom = new chatRoomModel({
    room,
    worker,
    user,
    userName,
    userPhoto,
    workerName,
    workerPhoto,
  });
  try {
    chatRoomModel.findOne(
      {
        room,
        worker,
        user,
      },
      async (err, doc) => {
        if (err) {
          console.log(err);
        }
        if (doc) {
          console.log("room already exists");
          io.emit(user, "Room already exists");
        } else {
          await newRoom.save();
          await userModel.findOneAndUpdate(
            { _id: user },
            { $push: { rooms: room } }
          );
          await workerModel.findOneAndUpdate(
            { _id: worker },
            { $push: { rooms: room } }
          );

          io.emit(user, "Room created");
          console.log("room created");
        }
      }
    );
  } catch (e) {
    console.log("Something went room ", e);
  }
}

// migrate data ub firebase to mongodb
async function migrate() {
  // let data = await FBadmin.firestore().collection("adverts").doc("adverts").get()
  // data = data.data()
  // // save to mongodb
  // console.log(data.data)
  // data.data.forEach(async (service) => {
  //   const adverts = new advertModel({
  //     bgImg: "https://res.cloudinary.com/dl3f5pgro/image/upload/v1689455989/Discount_Banner_bw19op.png",
  //     title: "",
  //     subtitle: "",
  //     route: "",
  //     url: "https://www.easeupgh.tech/",
  //   })
  //   await adverts.save()
  // const newService = new servicesModel({
  //   img: service.img,
  //   query: service.query,
  //   service: service.service
  // })
  // await newService.save()
  // }
  // )
}

module.exports.admin = FBadmin;
