require("dotenv").config();
const bcrypt = require("bcrypt");

// Verify 'sysadmin' password (needed for some important CRUDs)
const verifyAdminPass = () => async (req, res, next) => {
  // Check for authData req object's existence first
  if (!req.authData || !req.authData?.username) {
    return res.status(403).json({ error: "Åtkomst nekad!" });
  }
  // Check that username is 'sysadmin'
  if (req.authData.username !== "sysadmin") {
    return res
      .status(403)
      .json({
        error:
          "[verifyAdminPass]: Denna middleware är endast för Systemadministrarören!",
      });
  }
  if (!req.body?.password) {
    return res
      .status(400)
      .json({
        error:
          "[verifyAdminPass]: Lösenordet för Systemadministratören saknas!",
      });
  }

  // Use stored MongoDB connection
  let client;
  try {
    client = req.dbClient;
    const dbColUsers = req.dbCol;

    // Find correct user (sysadmin)
    const correctUser = await dbColUsers.findOne({
      username: req.authData.username,
    });
    if (!correctUser) {
      client.close();
      return res.status(403).json({
        error: "[verifyAdminPass]: Användarnamn och/eller lösenord är fel!",
      });
    }
    // Then check password
    const adminPassResult = await bcrypt.compare(
      req.body.password,
      correctUser.userpassword
    );
    if (!adminPassResult) {
      client.close();
      return res.status(403).json({
        error: "[verifyAdminPass]: Användarnamn och/eller lösenord är fel!",
      });
    }
    // Password OK so move on. We keep MongoDB connection open!
    console.log("[veryifyAdminPass]: Sysadmin PW OK!");
    next();
  } catch (e) {
    return res.status(500).json({
      error: "[verifyAdminPass]: Databasfel! Kontakta Systemadministratör!",
    });
  }
};

module.exports = verifyAdminPass;
