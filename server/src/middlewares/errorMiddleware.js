import { error } from '../utils/logger.js';

/**
 * Global Error Handling Middleware.
 * Catches all errors and sends a clean JSON response to the client.
 */
const errorMiddleware = (err, req, res, next) => {
  // 1. Log the error for internal debugging
  error(`[GLOBAL ERROR HANDLER]: ${err.stack || err.message}`);

  // 2. Determine status code (default to 500 if not set)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred';

  // 3. Send structured response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Only show stack trace in development mode (if needed)
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorMiddleware;

