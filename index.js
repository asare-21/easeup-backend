require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;
const morgan = require('morgan')
const { connect } = require('mongoose')
const log = require('npmlog')
const rateLimit = require('express-rate-limit')
const { USER_ROUTE } = require('./routes/user_route')
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { msg: 'Too many requests from this IP, please try again later', status: 429, success: false },
    onLimitReached: (req, res, options) => {
        log.warn(`Rate limit reached for IP: ${req.ip}`)
    }
})

// Static files
app.use(express.static('public'));



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'))
app.use(limiter)

// Routes
app.use('/user', USER_ROUTE);

// Starting the server
http.listen(PORT, async () => {
    try {
        log.info(`Listening on port ${PORT}`);
        await connect(`mongodb+srv://${process.env.easeup_admin_founder_email}:${process.env.easeup_admin_founder_pass}@easeup-cluster.pfxvast.mongodb.net/?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        log.info('Connected to MongoDB')
    } catch (err) {
        log.error(err)
    }
})



