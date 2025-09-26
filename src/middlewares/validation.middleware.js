
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = {};
    result.error.issues.forEach((err) => {
      const field = err.path.join("."); // Get the field name
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(err.message);
    });

    return res.status(400).json({errors: formattedErrors});
  }
  req.body = result.data;
  next();
}

module.exports = {validateBody};