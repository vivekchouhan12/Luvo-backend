// Vercel serverless entrypoint: export the Express app instance.
// The @vercel/node builder will call this as the function handler.
const app = require('../app');

module.exports = app;
