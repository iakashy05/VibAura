/**
 * A wrapper utility for async express routes/controllers to catch errors 
 * and pass them to the global error handler middleware automatically.
 * This removes the need for repetitive try-catch blocks.
 * 
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - The wrapped express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

