require('dotenv').config();
const express = require('express');
const api = express();
const frontEndApp = express();
const app = express();
const admin = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const path = require('path');
const PORT = process.env.PORT || 3000;
const morgan = require('morgan')
const { connect } = require('mongoose')
const rateLimit = require('express-rate-limit')
const { USER_ROUTE } = require('./routes/api/user_route')
const { HOME } = require('./routes/api/index')
const { searchRoute } = require('./routes/api/searchRoute')
const { workerProfileVerificationRoute } = require('./routes/api/workerProfileVerify')
const { workerRoute } = require('./routes/api/workerRoute')
const { workerProfileRoute } = require('./routes/api/workerProfileRoute')
const { bookmarkRoute } = require('./routes/api/bookmarkRoute');
const log = require('npmlog')
const serviceAccount = require("./easeup.json");
const FBadmin = require("firebase-admin");
const vhost = require('vhost');
const compression = require('compression')
const helmet = require('helmet');
const { chatRoute } = require('./routes/api/chat');
const { chatRoomModel } = require('./models/chatRoomModel');
const { chatModel } = require('./models/chat_message_model');
const { workerModel } = require('./models/worker_models');
const { userModel } = require('./models/user_model');
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { msg: 'Too many requests from this IP, please try again later', status: 429, success: false },
    onLimitReached: (req, res, options) => {
        log.warn(`Rate limit reached for IP: ${req.ip}`)
    }
})

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.enable('trust proxy');
app.set('view engine', 'ejs');
app.set('views', 'views');
frontEndApp.use(express.static(path.join(__dirname, 'public')));
frontEndApp.use(express.static(path.join(__dirname, 'soon/assets')));
frontEndApp.enable('trust proxy');
frontEndApp.set('view engine', 'ejs');
frontEndApp.set('views', 'views');
frontEndApp.use(compression())
api.use(compression())
admin.use(compression())
admin.use(helmet())
admin.use(express.json());
admin.use(express.urlencoded({ extended: true }));
admin.use(morgan('combined'))
admin.use(limiter)
admin.disable('x-powered-by');
frontEndApp.use(helmet())
api.use(helmet())
api.disable('x-powered-by');
frontEndApp.disable('x-powered-by');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'))
app.use(limiter)



// vhost (subdomain and domain)
if (process.env.NODE_ENV === 'production') {
    app.use(vhost('api.easeupgh.tech', api));
    app.use(vhost('easeupgh.tech', frontEndApp));
    app.use(vhost('www.easeupgh.tech', frontEndApp));
    admin.use(vhost('admin.easeupgh.tech', admin));
    frontEndApp.use('/', HOME)
    // api routes for production
    api.use('/user', USER_ROUTE);
    api.use('/search', searchRoute)
    api.use('/bookmark', bookmarkRoute)
    api.use('/verify-worker-profile', workerProfileVerificationRoute)
    api.use('/worker', workerRoute)
    api.use('/worker-profile', workerProfileRoute)
    api.use('/room', chatRoute)
    // handle 404
    api.use((req, res, next) => {
        return res.status(404).json({
            msg: 'Undefined route', status: 404, success: false,
            path: req.path
        })
    })

    frontEndApp.use((req, res, next) => {
        return res.render('404',)
    })
    // enforce https
    api.use(function (req, res, next) {
        if (process.env.NODE_ENV != 'development' && !req.secure) {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    })
    frontEndApp.use(function (req, res, next) {
        if (process.env.NODE_ENV != 'development' && !req.secure) {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    })
}
else {
    // Development Routes
    app.use('/', HOME)
    app.use('/user', USER_ROUTE);
    app.use('/search', searchRoute)
    app.use('/bookmark', bookmarkRoute)
    app.use('/verify-worker-profile', workerProfileVerificationRoute)
    app.use('/worker', workerRoute)
    app.use('/worker-profile', workerProfileRoute)
    app.use('/room', chatRoute)
}





// Starting the server
http.listen(PORT, async () => {
    try {
        log.info(`Listening on port ${PORT}`);
        await connect(`mongodb+srv://${process.env.easeup_admin_founder_email}:${process.env.easeup_admin_founder_pass}@easeup-cluster.pfxvast.mongodb.net/?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'easeup'
        })
        await FBadmin.initializeApp({
            credential: FBadmin.credential.cert(serviceAccount)
        });
        log.info('Connected to MongoDB')
    } catch (err) {
        log.error(err)
    }
})


// /////////////////////// Socket.io
io.on('connection', (socket) => {

    console.log('a user connected');
    socket.on('disconnected', (msg) => {
        console.log('message: ', msg);
    });
    // log any event
    // socket.onAny((event, ...args) => {
    //     console.log("Socket events ", event, args);
    // })
    socket.on('connected', (msg) => {
        console.log('message: ', msg);
    });
    // list all rooms
    socket.rooms.forEach(room => {
        console.log('Rooms ', room)
    })

    // socket.on('typing', (room) => {
    //     socket.to(room).emit(from === user ? worker : user, chat)

    // });

    // create chat room
    socket.on('new-room', async (room) => {
        /**
         * new room structure
         * {
         * room,
         * worker,
         * user
         * }
         */
        await createNewRoom(room)
        console.log('room created')
    })

    // join room
    socket.on('join-room', async (chat) => {
        socket.join(chat.room); // add socket to room
        const clients = io.sockets.adapter.rooms[chat.room];
        if (!clients) {
            console.log(`No clients in room: ${chat.room}`);
            return;
        }
        const clientIds = Object.keys(clients.sockets);
        console.log(`Clients in room '${chat.room}':`, clientIds);
        console.log(`Room data sent'${chat.room}':`, chat);
    })

    socket.on('message', async (chat) => {

        // io.to(chat.room).emit('message', chat); // broadcast message to all users except sender
        socket.broadcast.to(chat.room).emit('message', chat);
        // broadcast message to all users 
        socket.broadcast.emit('message', chat, (msg) => {
            console.log('message sent', chat)
        })
        // socket.emit(chat.from === chat.user ? chat.worker : chat.user, chat)

        await saveChat(chat)

    })
}
)
// Save chat to database
async function saveChat(chat) {
    const { room, user, message, from, worker, media } = chat
    const newChat = new chatModel({
        room,
        user,
        message,
        from,
        worker,
        media
    })
    try {
        // emit message to user
        console.log('message sent from', from)
        console.log('message sent to', from === user ? worker : user)
        // io.to(room).emit(from === user ? user : worker, chat)
        // emit mesaage to user before saving to database
        await newChat.save()

    } catch (err) {
        console.log(err)
        io.emit(room, ' Error saving message')
    }
}


// Create a new room
async function createNewRoom(_room) {
    const { room, worker, user, userName, userPhoto, workerName, workerPhoto } = _room
    const newRoom = new chatRoomModel({
        room,
        worker,
        user,
        userName,
        userPhoto,
        workerName,
        workerPhoto
    })
    try {
        chatRoomModel.findOne({
            room, worker, user
        }, async (err, doc) => {
            if (err) {

                console.log(err)
            }
            if (doc) {
                console.log('room already exists')
                io.emit(user, 'Room already exists')
            }
            else {
                await newRoom.save()
                await userModel.findOneAndUpdate({ _id: user }, { $push: { rooms: room } })
                await workerModel.findOneAndUpdate({ _id: worker }, { $push: { rooms: room } })

                io.emit(user, 'Room created')
                console.log('room created')
            }
        })
    } catch (e) {
        console.log('Something went room ', e)
    }
}