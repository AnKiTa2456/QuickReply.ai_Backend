// Express 4 doesn't catch rejected promises from async route handlers — an
// unhandled rejection (e.g. a DB query failure) crashes the process instead
// of producing a clean error response. Wrap handlers with this so errors
// reach the error-handling middleware in index.js.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
