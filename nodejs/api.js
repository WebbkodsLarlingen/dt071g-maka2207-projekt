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
const mongoDB = require("./db.js");
const verifyAdminPass = require("./verifyAdminPassword.js");
const verifyAccessToken = require("./verifyAccessToken");

// ENDPOINT: /api/login
router.post("/login", mongoDB("maka2207", "users"), async (req, res) => {
  // First check if username & password are provided
  if (!req.body.username || !req.body.password) {
    return res
      .status(403)
      .json({ error: "Användarnamn och/eller lösenord saknas!" });
  }
  // Then store username+password to compare against
  const user = req.body.username;
  const pw = req.body.password;

  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

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
            expiresIn: "1d",
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
              last_login: new Date(),
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
      message: "Databasfel. Kontakta Systemadministratören!",
    });
  }
});

// ENDPOINT: /api/logout
router.post("/logout", mongoDB("maka2207", "users"), async (req, res) => {
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
      try {
        // Then grab maka2207 database and its collection "users"
        client = req.dbClient;
        const dbColUsers = req.dbCol;

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
router.use(verifyAccessToken());

// ENDPOINTS: /api/showallusers & /api/showuser
router.get("/showallusers", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Then grab its variables to check against in database
  const username = req.authData.username;
  // Initialize MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({ username: username });
    if (!findUser) {
      client.close();
      return res
        .status(403)
        .json({ error: "Åtkomst nekad! (Ingen användare)" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("get_users")) {
      client.close();
      return res
        .status(403)
        .json({ error: "Åtkomst nekad! (Rollen ej tilldelad)" });
    }
    // Grab all users whose `username` are NOT equal to 'sysadmin' converted to array
    const returnUsersData = await dbColUsers
      .find({
        username: { $ne: "sysadmin" },
      })
      .toArray();
    // Map to a new object to filter out data and then finally return it
    const filterData = returnUsersData.map((user) => {
      return {
        username: user.username,
        useremail: user.useremail,
        userfullname: user.userfullname,
        access_token: user.access_token == "" ? "Utgått" : user.access_token,
        refresh_token: user.refresh_token == "" ? "Utgått" : user.refresh_token,
        account_blocked: user.account_blocked ? "Ja" : "Nej",
        account_activated: user.account_activated ? "Ja" : "Nej",
        last_login: user.last_login == "" ? "Aldrig inloggad" : user.last_login,
      };
    });
    client.close();
    return res
      .status(200)
      .json({ success: "Alla användare hämtade!", data: filterData });
  } catch (e) {
    // MONGODB FAILURE!
    client.close();
    return res.status(403).json({ error: "Åtkomst nekad!", e });
  }
});

router.get("/showuser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check `user`name or `user`email was provided!
  if (!req.body?.user) {
    return res
      .status(400)
      .json({ error: "Användarnamn eller e-post för användaren saknas!" });
  }
  // Not allowed to read about 'sysadmin'
  const sysadminCheck = req.body.user.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Du saknar behörighet att läsa om denna användare!`,
    });
  }

  // Grab `username` from authData & `user` from JSON Body
  const username = req.authData.username;
  const user = req.body.user;

  // Initialize MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({ username: username });
    if (!findUser) {
      client.close();
      return res
        .status(403)
        .json({ error: "Åtkomst nekad! (Ingen användare)" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("get_users")) {
      client.close();
      return res
        .status(403)
        .json({ error: "Åtkomst nekad! (Rollen ej tilldelad)" });
    }

    // Try find `user` by username or useremail
    const findSingleUser = await dbColUsers.findOne({
      $or: [{ username: user }, { useremail: user }],
    });
    // `user` not found
    if (!findSingleUser) {
      client.close();
      return res.status(404).json({
        error: `Användaren '${user}' finns inte. Eventuellt kontrollera stavning!`,
      });
    }
    // User found and OK to read! Create new object with filtered data
    const returnSingleUser = {
      username: findSingleUser.username,
      useremail: findSingleUser.useremail,
      userfullname: findSingleUser.userfullname,
      access_token:
        findSingleUser.access_token == ""
          ? "Utgått"
          : findSingleUser.access_token,
      refresh_token:
        findSingleUser.refresh_token == ""
          ? "Utgått"
          : findSingleUser.refresh_token,
      account_blocked: findSingleUser.account_blocked ? "Ja" : "Nej",
      account_activated: findSingleUser.account_activated ? "Ja" : "Nej",
      roles: findSingleUser.roles,
      last_login:
        findSingleUser.last_login == ""
          ? "Aldrig inloggad"
          : findSingleUser.last_login,
    };
    client.close();
    return res
      .status(200)
      .json({ success: "Användaren hämtad!", data: returnSingleUser });
  } catch (e) {
    // MONGODB FAILURE!
    client.close();
    return res.status(403).json({ error: "Åtkomst nekad! (DB)", e });
  }
});

// ENDPOINTS: /api/adduser & /api/deleteuser
router.post("/adduser", mongoDB("maka2207", "users"), async (req, res) => {});

router.delete(
  "/deleteuser",
  mongoDB("maka2207", "users"),
  verifyAdminPass(),
  async (req, res) => {
    // Check for authData req object's existence first
    if (!req.authData || !req.authData?.username) {
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Check `user`name or `user`email was provided!
    if (!req.body?.user) {
      return res
        .status(400)
        .json({ error: "Användarnamn eller e-post för användaren saknas!" });
    }

    // Not allowed to delete 'sysadmin'
    const sysadminCheck = req.body.user.toLowerCase();
    if (
      sysadminCheck === "sysadmin" ||
      sysadminCheck === "sysadmin@aidatorer.se"
    ) {
      return res.status(403).json({
        error: `Du saknar behörighet att radera denna användare!`,
      });
    }

    // Grab necessary variables
    const username = req.authData.username;
    const userToDelete = req.body.user;

    // Init MongoDB
    let client;
    try {
      // Then grab maka2207 database and its collection "users"
      client = req.dbClient;
      const dbColUsers = req.dbCol;

      // Look up `username` to match it exactly | returns null if not found
      const correctUser = await dbColUsers.findOne({ username: username });

      // If we don't find it, we assume wrong username or password and stop request right here
      if (!correctUser) {
        // correctUser == 'sysadmin'
        return res
          .status(403)
          .json({ error: "Du saknar behörighet att radera denna användare!" });
      }

      // Look up `user` to match it exactly | returns null if not found
      const findSingleUser = await dbColUsers.findOne({
        $or: [{ username: userToDelete }, { useremail: userToDelete }],
      });

      // If `user`'s username or useremail doesn't exist
      if (!findSingleUser) {
        client.close();
        return res.status(404).json({
          error: `Användaren med användaruppgiften '${userToDelete}' finns inte. Eventuellt kontrollera stavning!`,
        });
      }

      // Now delete user!
      const deleteUser = await dbColUsers.deleteOne({
        $or: [{ username: userToDelete }, { useremail: userToDelete }],
      });

      // When user found
      if (deleteUser.deletedCount === 1) {
        client.close();
        return res.status(200).json({
          success: `Användaren med användaruppgiften '${userToDelete}' raderad!`,
        });
        // When user not found
      } else {
        client.close();
        return res.status(404).json({
          error: `Användaren '${userToDelete}' finns inte. Eventuellt kontrollera stavning!`,
        });
      }
    } catch (e) {
      client.close();
      return res
        .status(500)
        .json({ error: "Databasfel. Kontakta Systemadministratören!" });
    }
  }
);

// ENDPOINTS: /api/blockuser & /api/unblockuser & /api/changeuser & /api/userroles & /api/logoutuser
router.put("/blockuser", mongoDB("maka2207", "users"), async (req, res) => {});
router.put(
  "/unblockuser",
  mongoDB("maka2207", "users"),
  async (req, res) => {}
);
router.put(
  "/changeuser",
  mongoDB("maka2207", "users"),
  verifyAdminPass(),
  async (req, res) => {}
);
router.put(
  "/userroles",
  mongoDB("maka2207", "users"),
  verifyAdminPass(),
  async (req, res) => {}
);
router.put("/logoutuser", mongoDB("maka2207", "users"), async (req, res) => {});

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
