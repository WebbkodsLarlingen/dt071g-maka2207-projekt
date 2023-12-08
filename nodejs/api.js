require("dotenv").config();
// This imports Express and uses the in-built router object in Express
const express = require("express");
const router = express.Router();
const path = require("path");
// Now we need MongoClient from mongodb npm package and...
const { MongoClient } = require("mongodb");
const dbURL = process.env.MONGO_URL;
const bcrypt = require("bcrypt"); // ...bcrypt to check stored password
const jwt = require("jsonwebtoken"); // ...and JSON Web Token to sign a newly created JWT!
const refreshKey = process.env.REFRESH_TOKEN;
const tokenKey = process.env.ACCESS_TOKEN;

// ENDPOINT: /api/login
router.post("/login", async (req, res) => {
  // First check if username & password are provided
  if (!req.body.username || !req.body.password) {
    return res
      .status(403)
      .json({ error: "Användarnamn och/eller lösenord saknas!" });
  }
  // Then store username+password to compare against
  const user = req.body.username;
  const pw = req.body.password;

  // Then initiate MongoDB connection
  let client;
  try {
    client = new MongoClient(dbURL);
    await client.connect();

    // Then grab maka2207 database and its collection "users"
    const dbColUsers = client
      .db(process.env.MONGO_DB)
      .collection(process.env.MONGO_DB_COL_USERS);

    // Look up `username` to match it exactly | returns null if not found
    const correctUser = await dbColUsers.findOne({ username: user });

    // If we don't find it, we assume wrong username or password and stop request right here
    if (!correctUser) {
      return res
        .status(403)
        .json({ error: "Användarnamn och/eller lösenord är fel!" });
    }

    // If we are here, username does exist so now we compare against password!
    const storedPw = correctUser.userpassword;
    bcrypt.compare(pw, storedPw, async (err, result) => {
      // Internal error but we still say it is not because of it for security reasons
      if (err) {
        client.close();
        return res.status(403).json({
          error: "Användarnamn och/eller lösenord är fel!",
        });
      }
      // Correct password after check!
      if (result) {
        // Now create JWT Token and sign it using ACCESS_TOKEN
        const accessToken = jwt.sign(
          {
            iss: "AI Datorer AB",
            username: correctUser.username,
          },
          process.env.ACCESS_TOKEN,
          {
            expiresIn: "10s",
          }
        );
        // Now create JWT Token and sign it using REFRESH_TOKEN
        const refreshToken = jwt.sign(
          {
            iss: "AI Datorer AB",
            username: correctUser.username,
          },
          process.env.REFRESH_TOKEN,
          {
            expiresIn: "1d",
          }
        );
        console.log("ACCESS TOKEN & REFRESH TOKEN ISSUED!");
        // Encrypt the JWT which will also have a Buffer<> that will be stored in MongoDB!

        // Insert new access & refresh token for successfully logged in user!
        const updateLoggedInUser = await dbColUsers.updateOne(
          {
            username: correctUser.username,
          },
          {
            $set: {
              access_token: accessToken,
              refresh_token: refreshToken,
            },
          }
        );

        // If modifiedCount > 0 then we successfully stored the encrypted access token!
        if (updateLoggedInUser.modifiedCount > 0) {
          // So, let's now FINALLY send it back to the user
          client.close();

          // Send refresh token in httpOnly cookie
          // and send short-lived access tooken in JSON that will be stored in JS memory for client!
          res.cookie("refresh_token", refreshToken, { httpOnly: true });
          return res.status(200).json({
            success: "Inloggad. Välkommen in!",
            accessToken: accessToken,
          });
        }
        client.close();
        return res
          .status(403)
          .json({ error: "Något gick fel vid inloggning. Prova igen!" });
      } // Wrong password after check!
      else {
        client.close();
        return res
          .status(403)
          .json({ error: "Användarnamn och/eller lösenord är fel!" });
      }
    });
  } catch (e) {
    // Catch and return 500 Internal Error if it happens!
    client.close();
    return res.status(500).json({
      message: "Fel inträffat på serversidan!",
    });
  }
});

// ENDPOINT: /api/logout
router.post("/logout", async (req, res) => {
  // If refresh_token cookie found
  if (req.cookies.refresh_token && req.cookies.refresh_token != "") {
    // Store cookie
    const refreshToken = req.cookies.refresh_token;
    // Then JWT.verify it first
    try {
      const decoded = jwt.verify(refreshToken, refreshKey);
      const user = decoded.username;
      // Initialize MongoDB
      let client;
      // Remove both refresh_token and access_token for `user`
      try {
        client = new MongoClient(dbURL);
        await client.connect();

        // Select `users` collection from database maka2207
        const dbColUsers = client
          .db(process.env.MONGO_DB)
          .collection(process.env.MONGO_DB_COL_USERS);

        // Try finding user first if they logged out just after sysadmin changed their username!
        const findUser = await dbColUsers.findOne({ username: user });
        if (!findUser) {
          return res.status(403).json({ error: "Utloggningen misslyckades!" });
        }

        // Then Update `user` by deleting access & refresh tokens!
        const deleteTokens = await dbColUsers.updateOne(
          { username: user },
          {
            $set: { access_token: "", refresh_token: "" },
          }
        );

        // If successful modifiedCount should be 1
        if (deleteTokens.modifiedCount > 0) {
          // Then close MongoDB, send back empty refresh_token cookie
          client.close();
          // Cookie is not only empty but also expires immediately upon receiving it
          res.cookie("refresh_token", "", {
            expires: new Date(0),
            httpOnly: true,
          });
          console.log("USER LOGGED OUT!");
          return res.status(200).json({ success: "Utloggad!" });
        }
      } catch (err) {
        // When failing to delete tokens for `user`
        client.close();
        return res.status(500).json({ error: "Utloggningen misslyckades!" });
      }
    } catch (err) {
      // When failing to verify JWT
      return res.status(500).json({ error: "Utloggningen misslyckades!" });
    }
  } // If refresh_token cookie not found!
  else {
    return res.status(403).json({ error: "Utloggningen misslyckades!" });
  }
});

// ENDPOINT: /api/refreshatoken - using Refresh Token to refresh the access token
router.post("/refreshatoken", async (req, res) => {});

// ENDPOINTS THAT DEMAND VALID ACCESS TOKEN!
// MIDDLEWARE - CHECK VALID ACCESS TOKEN!!!
router.use(async (req, res, next) => {
  // Check if access_token exists (stored in authorization)
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check if authorization header begins with "Bearer "
  if (!req.headers.authorization.includes("Bearer ")) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Store access token and try decoding it
  const aToken = req.headers.authorization.split("Bearer ")[1];
  try {
    // IMPORTANT: jwt.verify will FAIL if access token has expired despite being otherwise correct!
    const decoded = jwt.verify(aToken, tokenKey);
    // If we succeed then we pass on the `req` object!
    let client;
    try {
      // Connect DB, select `maka2207` database + `users` collection
      client = new MongoClient(dbURL);
      await client.connect();
      const dbColUsers = client
        .db(process.env.MONGO_DB)
        .collection(process.env.MONGO_DB_COL_USERS);
      const findUser = await dbColUsers.findOne({ username: decoded.username });

      // Find user stored in JWT Access_token and then compare if same in database for that user!
      if (!findUser) {
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      if (findUser.access_token === aToken) {
        console.log("ACCESS TOKEN FORTFARANDE GILTIG! SKICKAR VIDARE!");
        next();
      } else {
        console.log("ACCESS TOKEN LÖPT UT!");
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
    } catch (e) {
      return res.status(500).json({ error: "Åtkomst nekad!" });
    }
  } catch (e) {
    // Invalid or expired access token
    return res.status(500).json({ error: "Åtkomst nekad!" });
  }
});

// ENDPOINTS: /api/showallusers & /api/showuser
router.get("/showallsusers", async (req, res) => {});
router.get("/showuser", async (req, res) => {});

// ENDPOINTS: /api/adduser & /api/deleteuser
router.post("/adduser", async (req, res) => {});
router.delete("/deleteuser", async (req, res) => {});

// ENDPOINTS: /api/blockuser & /api/unblockuser & /api/changeuser & /api/userroles
router.put("/blockuser", async (req, res) => {});
router.put("/unblockuser", async (req, res) => {});
router.put("/changeuser", async (req, res) => {});
router.put("/userroles", async (req, res) => {});

// This is the LAST one because if we have it before others it will be ran and stop the rest of the script!
// This is the "catch-all" responses for CRUD when someone is requesting something that does not exist.
router.all("*", (req, res) => {
  if (req.headers.accept.includes("html")) {
    return res.sendFile(path.join(__dirname, "/images", "easteregg.jpg"));
  }
  return res.status(400).json({ error: `Ogiltigt REST API-anrop!` });
});

// Export it so it can be used by `app.js` in root folder.
module.exports = router;
