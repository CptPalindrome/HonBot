const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ format: winston.format.colorize(), filename: './HonLogs/error.log', level: 'error' }),
        new winston.transports.File({ format: winston.format.colorize(), filename: './HonLogs/combined.log' }),
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple())})
    ]
});

module.exports = logger;