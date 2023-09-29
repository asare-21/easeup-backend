const logger = require('../services/logger')

class RequestLogger {
    requestLogger = (req, res, next) => {
        logger.info(`Method: ${req.method}  URL: ${req.url}  Hostname: ${req.ip}  Request-Body: ${req.body}`)
        next()
    }

    errorLogger = (err, req, res, next) => {
        logger.error(`Method: ${req.method}  URL: ${req.url}  Hostname: ${req.ip}  Request-Body: ${req.body}  Error: ${err}`)
        next(err)
    }
}


module.exports.RequestLogger = new RequestLogger()