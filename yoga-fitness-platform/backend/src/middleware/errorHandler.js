export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details;
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({ ok: false, error: message, ...(details ? { details } : {}) });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: 'Not found' });
}
