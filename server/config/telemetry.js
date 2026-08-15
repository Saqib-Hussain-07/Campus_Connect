const logger = require('../utils/logger');

/**
 * OpenTelemetry Distributed Tracing Configuration
 * Active when OTEL_EXPORTER_OTLP_ENDPOINT is configured.
 */
function initTelemetry() {
  const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (!otelEndpoint) {
    logger.info('OpenTelemetry: Disabled (OTEL_EXPORTER_OTLP_ENDPOINT not set).');
    return null;
  }

  try {
    logger.info(`OpenTelemetry: Initialized with endpoint ${otelEndpoint}`);
    return {
      endpoint: otelEndpoint,
      serviceName: process.env.OTEL_SERVICE_NAME || 'campusconnect-server'
    };
  } catch (err) {
    logger.warn('OpenTelemetry initialization error:', err.message);
    return null;
  }
}

module.exports = { initTelemetry };
