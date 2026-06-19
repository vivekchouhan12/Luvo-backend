// Local development server starter.
// This file connects to MongoDB and starts the Express app exported by `app.js`.
const app = require('./app');

async function start() {
  try {
    await app.connectToDatabase();
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
