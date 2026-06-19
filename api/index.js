const serverless = require('serverless-http');
const app = require('../app');

// Ensure the database connection is initiated at cold start so
// subsequent invocations reuse the cached connection promise.
app.connectToDatabase && app.connectToDatabase().catch((err) => {
	console.error('Failed to connect to DB during cold start:', err);
});

module.exports = serverless(app);
