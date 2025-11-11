export function notFound(req, res, _next) {
  res.status(404).json({ message: `Not Found: ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  // Log full error on server for debugging
  // eslint-disable-next-line no-console
  console.error("Error:", err.message, err.code || "", err.stack || "");
  const payload = { message: err.message || "Server Error" };
  if (process.env.NODE_ENV !== "production") {
    if (err.code) payload.code = err.code;
    if (err.sqlMessage) payload.sqlMessage = err.sqlMessage;
  }
  res.status(status).json(payload);
}


