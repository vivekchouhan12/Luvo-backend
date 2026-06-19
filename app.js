const dotenv = require("dotenv");
dotenv.config();
// core modules
const path = require("path");
// Ensure Node prefers IPv4 for DNS results to avoid SRV timeouts on some networks/Windows
require("dns").setDefaultResultOrder("ipv4first");

// External Modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");


const rootDir = require("./utils/pathUtil");
const errorController = require("./controllers/errors");

// Use environment variable for the MongoDB URI in production (Vercel).
// Fallback to the existing hard-coded value for local development only.
const DB_PATH =
  process.env.MONGO_URI ||
  "mongodb+srv://root:vroot@vivekchouhan.qpww3tl.mongodb.net/Luvo?appName=VivekChouhan";

const app = express();
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
  // Pass options through to the MongoDB driver
  connectionOptions: {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  },
}); 

// Local Modules - Must be after upload is defined
const placeRouter = require("./routes/placesRouter");
const authRouter = require("./routes/authRouter");

// Middleware to parse URL-encoded bodies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(rootDir, "public")));
// Session secret configuration
// In production `SESSION_SECRET` must be set as an environment variable
// (for example in Vercel dashboard). For development a fallback is used
// but it is insecure and should be replaced.
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required in production");
}
// Generate a secure secret locally with:
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret-change-me";

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: store,
}));

// Routes
app.use(authRouter);
app.use(placeRouter);

app.use(errorController.pageNotFound);

/*
  Export the Express `app` and `connectToDatabase()` so a separate
  starter (for example `server.js`) can initialize the database
  connection and call `app.listen()` for local or production servers.
  The connection promise is cached on `global` to allow reuse.
*/

const PORT = process.env.PORT || 4000; // used for local dev only

async function _cleanupLegacyIndex() { 
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: "places" }).toArray();
    if (collections.length) {
      const indexes = await db.collection("places").indexes();
      const hasSlugIndex = indexes.some((ix) => ix.name === "slug_1");
      if (hasSlugIndex) {
        await db.collection("places").dropIndex("slug_1");
        console.log("Dropped legacy index 'slug_1' from places collection");
      }
    }
  } catch (idxErr) {
    console.warn("Index cleanup skipped:", idxErr?.message || idxErr);
  }
}

async function connectToDatabase() {
  // Cache the connection/promise on the global object to survive hot reloads
  // and to allow reuse across serverless invocations in certain runtimes.
  if (global._mongooseConnectionPromise) {
    return global._mongooseConnectionPromise;
  }

  const connectPromise = mongoose
    .connect(DB_PATH, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    })
    .then(async () => {
      console.log("Connected to MongoDB");
      // Run any lightweight startup tasks (index cleanup) safely.
      await _cleanupLegacyIndex();
      return mongoose;
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB", err);
      throw err;
    });

  // store for reuse
  global._mongooseConnectionPromise = connectPromise;
  return connectPromise;
}

// Export the app and connect function for use by `server.js`.
module.exports = app;
module.exports.connectToDatabase = connectToDatabase;

/*
  Example local starter (`server.js`):
    const app = require('./app');
    app.connectToDatabase().then(() => {
      app.listen(process.env.PORT || 4000, () => console.log('Listening'));
    });

  For deployments that require a serverless handler, provide a separate
  entry (for example `api/index.js`) that adapts this app to the target
  environment. This file intentionally does not include serverless code.
*/
