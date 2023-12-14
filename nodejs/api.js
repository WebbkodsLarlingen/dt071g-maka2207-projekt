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
        roles: user.roles,
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

// GET /api/showuser
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
      roles: findSingleUser.roles ? findSingleUser.roles : "",
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
router.post("/adduser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check for needed params in JSON Body!
  if (!req.body?.username) {
    return res
      .status(400)
      .json({ error: "Ange ett användarnamn för den nya användaren!" });
  }
  if (!req.body?.useremail) {
    return res
      .status(400)
      .json({ error: "Ange en e-postadress för den nya användaren!" });
  }
  if (!req.body?.userpassword) {
    return res
      .status(400)
      .json({ error: "Ange ett lösenord för den nya användaren!" });
  }
  // Not allowed to add new user called 'sysadmin' or using their email
  const sysadminCheck = req.body.username.toLowerCase();
  const sysadminCheck2 = req.body.useremail.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck2 === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Denna användare finns redan!`,
    });
  }
  // Grab JSON Body now
  const bodyUsername = req.body.username;
  const bodyUseremail = req.body.useremail;
  let bodyUserpassword = req.body.userpassword;

  // Quickly check for simple valid email syntax
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(bodyUseremail)) {
    return res.status(400).json({
      error: "Ogiltigt e-postformat!",
    });
  }

  // Quickly check length for username
  if (bodyUsername.length < 2) {
    return res.status(400).json({
      error: "Användarnamn ska vara färst 2 tecken långt!",
    });
  }

  // Quickly check length for password
  if (bodyUserpassword.length < 10) {
    return res.status(400).json({
      error: "Lösenord ska vara färst 10 tecken långt!",
    });
  }
  // Init MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!findUser) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("post_users")) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }

    // Check so username or useremail is not already taken
    const findExistingUserOrEmail = await dbColUsers.findOne({
      $or: [{ username: bodyUsername }, { useremail: bodyUseremail }],
    });

    // If we do NOT return null, username or useremail already exists
    if (findExistingUserOrEmail) {
      client.close();
      return res.status(400).json({
        error: "Användarnamnet eller e-postadressen är redan registrerad!",
      });
    }

    // Hash password now because we can add user!
    bodyUserpassword = await bcrypt.hash(bodyUserpassword, 10);

    // Finally insert new user
    const addNewUser = await dbColUsers.insertOne({
      userip: "127.0.0.1",
      username: bodyUsername,
      useremail: bodyUseremail,
      userfullname: "",
      userpassword: bodyUserpassword,
      roles: ["get_images", "get_components"],
      access_token: "",
      refresh_token: "",
      account_activated: false,
      account_blocked: false,
      last_login: "",
    });

    // If we succeeded
    if (addNewUser) {
      client.close();
      return res.status(200).json({
        success: "Ny användare har skapats!!",
      });
    }
    // Here we failed creating new user!
    client.close();
    return res
      .status(500)
      .json({ error: "Misslyckades att skapa ny användare!" });
  } catch (e) {
    client.close();
    return res
      .status(500)
      .json({ error: "Databasfel. Kontakta Systemadministratören!" });
  }
});

// DELETE /api/deleteuser
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

// ENDPOINTS: /api/blockuser & /api/unblockuser & /api/changeuser & /api/userroles & /api/logoutuser & /api/activateuser & /api/deactivateuser
// PUT /api/blockuser
router.put("/blockuser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check for needed params in JSON Body!
  if (!req.body?.username) {
    return res
      .status(400)
      .json({ error: "Ange ett användarnamn att blockera!" });
  }

  // Grab JSON Body data
  const bodyUsername = req.body.username;

  // Not allowed to block 'sysadmin' or their email
  const sysadminCheck = req.body.username.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Du saknar behörighet att blockera denna användare!`,
    });
  }

  // Init MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!findUser) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("put_users")) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // NOW TRY FIND USER TO BLOCK
    const findUserToBlock = await dbColUsers.findOne({
      username: bodyUsername,
    });
    // User NOT found
    if (!findUserToBlock) {
      client.close();
      return res.status(404).json({
        error: `Användaren '${bodyUsername}' hittades ej. Eventuellt kontrollera stavning!`,
      });
    }
    // USER FOUND! So let's block them!
    const blockResult = await dbColUsers.findOneAndUpdate(
      { username: bodyUsername },
      { $set: { account_blocked: true } }
    );
    // When failed blocking
    if (!blockResult) {
      client.close();
      return res
        .status(500)
        .json({ error: "Misslyckades att blockera användaren!" });
    }
    // Otherwise success
    client.close();
    return res
      .status(200)
      .json({ success: `Användaren '${bodyUsername}' har blockerats!` });
  } catch (e) {
    client.close();
    return res
      .status(500)
      .json({ error: "Databasfel. Kontakta Systemadministratören!" });
  }
});

// PUT /api/unblockuser
router.put("/unblockuser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check for needed params in JSON Body!
  if (!req.body?.username) {
    return res
      .status(400)
      .json({ error: "Ange ett användarnamn att avblockera!" });
  }

  // Grab JSON Body data
  const bodyUsername = req.body.username;

  // Not allowed to (un)block 'sysadmin' or their email
  const sysadminCheck = req.body.username.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Denna användare kan ej blockeras och behöver ej avblockeras!`,
    });
  }

  // Init MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!findUser) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("put_users")) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // NOW TRY FIND USER TO UNBLOCK
    const findUserToBlock = await dbColUsers.findOne({
      username: bodyUsername,
    });
    // User NOT found
    if (!findUserToBlock) {
      client.close();
      return res.status(404).json({
        error: `Användaren '${bodyUsername}' hittades ej. Eventuellt kontrollera stavning!`,
      });
    }
    // USER FOUND! So let's unblock them!
    const unblockResult = await dbColUsers.findOneAndUpdate(
      { username: bodyUsername },
      { $set: { account_blocked: false } }
    );
    // When failed unblocking
    if (!unblockResult) {
      client.close();
      return res
        .status(500)
        .json({ error: "Misslyckades att avblockera användaren!" });
    }
    // Otherwise success
    client.close();
    return res
      .status(200)
      .json({ success: `Användaren '${bodyUsername}' har avblockerats!` });
  } catch (e) {
    client.close();
    return res
      .status(500)
      .json({ error: "Databasfel. Kontakta Systemadministratören!" });
  }
});

// PUT /api/activateuser
router.put("/activateuser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check for needed params in JSON Body!
  if (!req.body?.user) {
    return res.status(400).json({
      error:
        "Ange en användare (username,useremail) vars konto du vill aktivera!",
    });
  }
  // Not allowed to activate 'sysadmin' as they always are activated.
  const sysadminCheck = req.body.user.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Denna användare är alltid aktiverad!`,
    });
  }

  // Grab JSON Body data
  const user = req.body.user;
  // Init MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!findUser) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("put_users")) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // NOW WE LOOK UP USER TO ACTIVATE
    const findUserToActivate = await dbColUsers.findOne({
      $or: [{ username: user }, { useremail: user }],
    });
    // User NOT found
    if (!findUserToActivate) {
      client.close();
      return res.status(404).json({
        error: `Användaren '${user}' hittades ej. Eventuellt kontrollera stavning!`,
      });
    }
    // USER FOUND! So let's activate their account
    const activateResult = await dbColUsers.findOneAndUpdate(
      { $or: [{ username: user }, { useremail: user }] },
      { $set: { account_activated: true } }
    );
    // When failed activating
    if (!activateResult) {
      client.close();
      return res.status(500).json({
        error: `Misslyckades att aktivera användaren '${user}'!`,
      });
    }
    // Otherwise success
    client.close();
    return res.status(200).json({
      success: `Användarkontot för '${user}' har aktiverats!`,
    });
  } catch (e) {
    client.close();
    return res
      .status(500)
      .json({ error: "Databasfel. Kontakta Systemadministratören!" });
  }
});

// PUT /api/deactivateuser
router.put(
  "/deactivateuser",
  mongoDB("maka2207", "users"),
  async (req, res) => {
    // Check for authData req object's existence first
    if (!req.authData || !req.authData?.username) {
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Check for needed params in JSON Body!
    if (!req.body?.user) {
      return res
        .status(400)
        .json({ error: "Ange en användare vars konto du vill inaktivera!" });
    }
    // Not allowed to deactivate 'sysadmin'.
    const sysadminCheck = req.body.user.toLowerCase();
    if (
      sysadminCheck === "sysadmin" ||
      sysadminCheck === "sysadmin@aidatorer.se"
    ) {
      return res.status(403).json({
        error: `Denna användare är alltid aktiverad och kan ej inaktiveras!`,
      });
    }

    // Grab JSON Body data
    const user = req.body.user;
    // Init MongoDB
    let client;
    try {
      // Then grab maka2207 database and its collection "users"
      client = req.dbClient;
      const dbColUsers = req.dbCol;

      // Find correct user making the request
      const findUser = await dbColUsers.findOne({
        username: req.authData.username,
      });
      if (!findUser) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      // Then check if they are authorized to continue the request
      if (!findUser.roles.includes("put_users")) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      // NOW WE LOOK UP USER TO DEACTIVATE
      const findUserToDeactivate = await dbColUsers.findOne({
        $or: [{ username: user }, { useremail: user }],
      });
      // User NOT found
      if (!findUserToDeactivate) {
        client.close();
        return res.status(404).json({
          error: `Användaren '${user}' hittades ej. Eventuellt kontrollera stavning!`,
        });
      }
      // USER FOUND! So let's activate their account
      const deactivateResult = await dbColUsers.findOneAndUpdate(
        { $or: [{ username: user }, { useremail: user }] },
        { $set: { account_activated: false } }
      );
      // When failed deactivating
      if (!deactivateResult) {
        client.close();
        return res.status(500).json({
          error: `Misslyckades att inaktivera användaren '${user}'!`,
        });
      }
      // Otherwise success
      client.close();
      return res.status(200).json({
        success: `Användarkontot för '${user}' har inaktiverats!`,
      });
    } catch (e) {
      client.close();
      return res
        .status(500)
        .json({ error: "Databasfel. Kontakta Systemadministratören!" });
    }
  }
);

// PUT - /api/changeuser - change one of 3 possible properties of available user in DB
router.put(
  "/changeuser",
  mongoDB("maka2207", "users"),
  verifyAdminPass(),
  async (req, res) => {
    // Check for authData req object's existence first
    if (!req.authData || !req.authData?.username) {
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Check for needed params in JSON Body!
    if (!req.body?.username) {
      return res.status(400).json({
        error: "Ange användarnamn för användare du vill ändra uppgift för!",
      });
    }
    if (!req.body?.userprop) {
      return res.status(400).json({
        error:
          "Ange en användaruppgift (username,useremail,userpassword) du vill ändra för vald användare!",
      });
    }
    if (!req.body?.uservalue) {
      return res.status(400).json({
        error: "Ange nytt värdet för vald användaruppgift för vald användare!",
      });
    }
    // Not allowed to change 'sysadmin'
    const sysadminCheck = req.body.username.toLowerCase();
    if (sysadminCheck === "sysadmin") {
      return res.status(403).json({
        error: `Du saknar behörighet att ändra denna användare!`,
      });
    }

    // Grab existing JSON body data and compare against what can be changed
    const availableUserProps = ["username", "useremail", "userpassword"];
    const bodyUsername = req.body.username;
    const bodyUserprop = req.body.userprop.toLowerCase();
    let bodyUservalue = req.body.uservalue;

    // Check valid user property to change
    if (!availableUserProps.includes(bodyUserprop)) {
      return res.status(400).json({
        error:
          "Följande i taget kan ändras: 'username', 'useremail' eller 'userpassword' för vald användare!",
      });
    }
    // Quickly check for simple valid email syntax
    if (bodyUserprop == "useremail") {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(bodyUservalue)) {
        return res.status(400).json({
          error: "Ogiltigt e-postformat!",
        });
      }
    }
    // Quickly check length for username
    if (bodyUserprop == "username" && bodyUservalue.length < 2) {
      return res.status(400).json({
        error: "Användarnamn ska vara färst 2 tecken långt!",
      });
    }
    // Quickly check length for password
    if (bodyUserprop == "userpassword" && bodyUservalue.length < 10) {
      return res.status(400).json({
        error: "Lösenord ska vara färst 10 tecken långt!",
      });
    }

    // Init MongoDB
    let client;
    try {
      // Then grab maka2207 database and its collection "users"
      client = req.dbClient;
      const dbColUsers = req.dbCol;

      // Find correct user making the request
      const findUser = await dbColUsers.findOne({
        username: req.authData.username,
      });
      if (!findUser) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      // Then check if they are authorized to continue the request
      if (!findUser.roles.includes("put_users")) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }

      // Try find user to change
      const findSingleUser = await dbColUsers.findOne({
        username: bodyUsername,
      });

      // `username` not found
      if (!findSingleUser) {
        client.close();
        return res.status(404).json({
          error: `Användaren '${bodyUsername}' finns inte. Eventuellt kontrollera stavning!`,
        });
      }
      // Username found! So check new value doesn't already exist (email/username already being used)
      const findSameNewValue = await dbColUsers.findOne({
        $and: [
          { [bodyUserprop]: bodyUservalue },
          { username: { $ne: bodyUsername } },
        ],
      });
      // Deny change if value is already being used!
      if (findSameNewValue) {
        client.close();
        return res.status(400).json({
          error: `En användare har redan det nya värdet för '${bodyUserprop}'!`,
        });
      }
      // Hash new value if it is a password!
      if (bodyUserprop == "userpassword") {
        bodyUservalue = await bcrypt.hash(bodyUservalue, 10);
      }
      // Otherwise change it for exact one user with username: bodyUsername!
      const changeUserValueToNew = await dbColUsers.updateOne(
        { username: bodyUsername },
        { $set: { [bodyUserprop]: bodyUservalue } }
      );
      // If failing updating
      if (!changeUserValueToNew.modifiedCount > 0) {
        client.close();
        return res.status(500).json({
          error:
            "Misslyckades att uppdatera användaren! Har användaren redan samma användaruppgift?",
        });
      }
      // Otherwise success!
      return res
        .status(200)
        .json({ success: "Användarens användaruppgift har uppdaterats!" });
    } catch (e) {
      client.close();
      return res
        .status(500)
        .json({ error: "Databasfel. Kontakta Systemadministratören!" });
    }
  }
);
// PUT /api/userrules - CHANGE userroles (one role at a time!)
router.put(
  "/userroles",
  mongoDB("maka2207", "users"),
  verifyAdminPass(), // This Middleware will check & verify "req.body.password" automatically
  async (req, res) => {
    // Check for authData req object's existence first
    if (!req.authData || !req.authData?.username) {
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Check for needed params in JSON Body!
    if (!req.body?.user) {
      return res.status(400).json({
        error: "Ange användare (username,useremail) vars roller du vill ändra!",
      });
    }
    if (!req.body?.adddel) {
      return res.status(400).json({
        error: "Ange om du vill lägga till(add) eller radera(delete) en roll!",
      });
    }
    if (!req.body?.role) {
      return res.status(400).json({
        error:
          "Ange en roll du vill lägga till eller ta bort från vald användare!",
      });
    }

    // Not allowed to change roles for 'sysadmin'
    const sysadminCheck = req.body.user.toLowerCase();
    if (
      sysadminCheck === "sysadmin" ||
      sysadminCheck === "sysadmin@aidatorer.se"
    ) {
      return res.status(403).json({
        error: `Du saknar behörighet att ändra denna användares behörigheter!`,
      });
    }
    // Now grab JSON Body data
    const bodyRole = req.body.role.toLowerCase();
    const bodyAdddel = req.body.adddel.toLowerCase();
    const bodyUser = req.body.user;

    // What and how roles can be changed:
    const changeTypes = ["add", "delete"];
    const roleTypes = [
      "get_images",
      "post_images",
      "put_images",
      "delete_images",
      "get_components",
      "post_components",
      "put_components=",
      "delete_components",
    ];
    // Check if changeType & roleTypes match with JSON body
    if (!changeTypes.includes(bodyAdddel)) {
      return res.status(404).json({
        error: `Roll kan ej ändras med '${bodyAdddel}'!`,
      });
    }
    if (!roleTypes.includes(bodyRole)) {
      return res.status(404).json({
        error: `Rollen '${bodyRole}' finns ej!`,
      });
    }

    // Init MongoDB
    let client;
    try {
      // Then grab maka2207 database and its collection "users"
      client = req.dbClient;
      const dbColUsers = req.dbCol;

      // Find correct user making the request
      const findUser = await dbColUsers.findOne({
        username: req.authData.username,
      });
      if (!findUser) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      // Then check if they are authorized to continue the request
      if (!findUser.roles.includes("put_users")) {
        client.close();
        return res.status(403).json({ error: "Åtkomst nekad!" });
      }
      // NOW TRY CHANGE ROLES FOR USER (IF FOUND!)
      const findUserToChangeRole = await dbColUsers.findOne({
        $or: [{ username: bodyUser }, { useremail: bodyUser }],
      });

      // User NOT found
      if (!findUserToChangeRole) {
        client.close();
        return res.status(404).json({
          error: `Användaren '${bodyUser}' hittades ej. Eventuellt kontrollera stavning!`,
        });
      }

      // Check if role even exists to be deleted
      if (
        !findUserToChangeRole.roles.includes(bodyRole) &&
        bodyAdddel == "delete"
      ) {
        return res.status(404).json({
          error: `Användaren '${bodyUser}' har ej rollen '${bodyRole}'. Ingen roll har tagits bort!`,
        });
      } // Or to be added
      else if (
        findUserToChangeRole.roles.includes(bodyRole) &&
        bodyAdddel == "add"
      ) {
        return res.status(404).json({
          error: `Användaren '${bodyUser}' har redan rollen '${bodyRole}'. Ingen roll har lagts till!`,
        });
      }

      // User can get role added or deleted, so let's now change their role!
      let roleChangeResult;
      if (bodyAdddel === "add") {
        roleChangeResult = await dbColUsers.findOneAndUpdate(
          { $or: [{ username: bodyUser }, { useremail: bodyUser }] },
          { $addToSet: { roles: bodyRole } } // $addToSet won't add if it
        );
      } else if (bodyAdddel === "delete") {
        roleChangeResult = await dbColUsers.findOneAndUpdate(
          { $or: [{ username: bodyUser }, { useremail: bodyUser }] },
          { $pull: { roles: bodyRole } }
        );
      }
      // When failed changing their role
      if (!roleChangeResult) {
        client.close();
        return res.status(500).json({
          error: `Misslyckades att ändra en roll för användaren '${bodyUser}'!`,
        });
      }
      // Otherwise success
      client.close();
      if (bodyAdddel === "delete") {
        return res.status(200).json({
          success: `Rollen '${bodyRole}' har tagits bort från rollerna för användaren '${bodyUser}'!`,
        });
      } else if (bodyAdddel === "add") {
        return res.status(200).json({
          success: `Rollen '${bodyRole}' har lagts till bland rollerna för användaren '${bodyUser}'!`,
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
// PUT - /api/logoutuser
router.put("/logoutuser", mongoDB("maka2207", "users"), async (req, res) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check for needed params in JSON Body!
  if (!req.body?.user) {
    return res
      .status(400)
      .json({ error: "Ange en användare vars konto du vill logga ut!" });
  }
  // Not allowed to deactivate 'sysadmin'.
  const sysadminCheck = req.body.user.toLowerCase();
  if (
    sysadminCheck === "sysadmin" ||
    sysadminCheck === "sysadmin@aidatorer.se"
  ) {
    return res.status(403).json({
      error: `Denna användare kan endast loggas ut manuellt eller via utlöpt uppdateringsnyckel!`,
    });
  }

  // Grab JSON Body data
  const user = req.body.user;

  // Init MongoDB
  let client;
  try {
    // Then grab maka2207 database and its collection "users"
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user making the request
    const findUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!findUser) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // Then check if they are authorized to continue the request
    if (!findUser.roles.includes("put_users")) {
      client.close();
      return res.status(403).json({ error: "Åtkomst nekad!" });
    }
    // NOW WE LOOK UP USER TO LOGOUT!
    const findUserToLogout = await dbColUsers.findOne({
      $or: [{ username: user }, { useremail: user }],
    });
    // User NOT found
    if (!findUserToLogout) {
      client.close();
      return res.status(404).json({
        error: `Användaren '${user}' hittades ej. Eventuellt kontrollera stavning!`,
      });
    }
    // USER FOUND! So let's activate their account
    const logoutResult = await dbColUsers.findOneAndUpdate(
      { $or: [{ username: user }, { useremail: user }] },
      { $set: { access_token: "", refresh_token: "" } }
    );
    // When failed deactivating
    if (!logoutResult) {
      client.close();
      return res.status(500).json({
        error: `Misslyckades att logga ut användaren '${user}'!`,
      });
    }
    // Otherwise success
    client.close();
    return res.status(200).json({
      success: `Användaren '${user}' har loggats ut! (nycklar raderade)`,
    });
  } catch (e) {
    client.close();
    return res
      .status(500)
      .json({ error: "Databasfel. Kontakta Systemadministratören!" });
  }
});

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
