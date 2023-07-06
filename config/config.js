const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });
module.exports = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};
