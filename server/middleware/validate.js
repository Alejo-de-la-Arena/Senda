const { z } = require("zod");

function validate(schema) {
  return (req, res, next) => {
    try {
      const data = ["GET", "DELETE"].includes(req.method)
        ? req.query
        : req.body;
      const parsed = schema.parse(data);
      req.validated = parsed;
      next();
    } catch (err) {
      const data = ["GET", "DELETE"].includes(req.method)
        ? req.query
        : req.body;
      console.log("👉 validate() data received:", data);
      console.log(
        "👉 method:",
        req.method,
        "headers:",
        req.headers["content-type"]
      );
      return res
        .status(400)
        .json({ error: "ValidationError", detail: err.errors });
    }
  };
}

module.exports = { validate, z };
