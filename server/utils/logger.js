const winston = require('winston');

// Sensitive data redaction formatter
const redactSensitive = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = info.message
      .replace(/password["']?\s*:\s*["']?[^"'\s,{}]+["']?/gi, 'password: "[REDACTED]"')
      .replace(/token["']?\s*:\s*["']?[^"'\s,{}]+["']?/gi, 'token: "[REDACTED]"')
      .replace(/bearer\s+[^\s,{}]+/gi, 'Bearer [REDACTED]');
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    redactSensitive(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'campus-connect-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      )
    })
  ]
});

module.exports = logger;
