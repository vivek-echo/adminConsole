const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Configure the logger
const logger = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, message }) => {
            return `[${timestamp}] ${message}`;
        })
    ),
    transports: [
        new DailyRotateFile({
            filename: 'D:/bnrcDocument/logs/ADMIN_CONSOLE_%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '1000m',
            maxFiles: '14d', // Keep logs for 14 days
        }),
    ],
});

module.exports = logger;
