/**
 * A generic middleware to validate incoming request data against a Zod schema.
 * 
 * @param {ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} - The express middleware
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Validate the request body (or params/query if needed)
    schema.parse(req.body);
    next();
  } catch (err) {
    // If validation fails, format the Zod error and pass it to the global error handler
    const formattedError = new Error('Validation Failed');
    formattedError.statusCode = 400;
    formattedError.details = err.errors?.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    
    // Customize message to show the first error detail for simplicity
    if (formattedError.details && formattedError.details.length > 0) {
      formattedError.message = `Validation Error: ${formattedError.details[0].message} (${formattedError.details[0].field})`;
    }
    
    next(formattedError);
  }
};

export default validate;

