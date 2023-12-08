// Simple script to generate tokens that can be copy&pasteed into .env file!
const crypto = require("crypto");
console.log("ACCESS_TOKEN:", crypto.randomBytes(64).toString("hex"));
console.log("REFRESH_TOKEN:", crypto.randomBytes(64).toString("hex"));
console.log("ENCRYPTION_KEY:", crypto.randomBytes(16).toString("hex"));
console.log(
  "PUT THESE IN ITS FIELDS IN '.env' file! Otherwise, nothing won't work!"
);
