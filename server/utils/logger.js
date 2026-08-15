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

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    )
  })
];

// Better Stack / Logtail Transport Integration
const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN || process.env.BETTER_STACK_TOKEN;
if (logtailToken) {
  try {
    const { Logtail } = require('@logtail/node');
    const { LogtailTransport } = require('@logtail/winston');
    const logtail = new Logtail(logtailToken);
    transports.push(new LogtailTransport(logtail));
  } catch (e) {
    console.warn('Logtail/BetterStack transport initialization skipped:', e.message);
  }
}

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
  transports
});

module.exports = logger;
