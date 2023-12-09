require("dotenv").config();
const { MongoClient } = require("mongodb");
const dbURL = process.env.MONGO_URL;

// MIDDLEWARE: Database connection to chosen database & collection
const db = (dbName, colName) => async (req, res, next) => {
  try {
    const client = new MongoClient(dbURL);
    await client.connect();
    // Attack MongoDB client connection and its final DB Connection to its chosen collection
    req.dbClient = client;
    req.dbCol = client.db(dbName).collection(colName);
    next();
  } catch (e) {
    return res.status(500).json({
      error:
        "Kunde ej ansluta till REST API:s databas. Kontakta Systemadministratören!",
    });
  }
};

module.exports = db;
