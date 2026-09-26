export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const fields = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.');
          fields[path] = issue.message;
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.issues[0]?.message || 'Invalid request',
            fields
          }
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Malformed request data',
          fields: {}
        }
      });
    }
  };
}
