const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret);
};
const validateAuthToken = async (token) => {
  const user = await jwt.verify(token, config.jwtSecret);
  return user;
};


const verifyJWT = async (req, res, next) => {
  console.log("Called")
  let token = req.headers["authorization"];
  if (token && typeof token === "string") {
    try {
      const authenticationScheme = "Bearer ";
      if (token.startsWith(authenticationScheme)) {
        token = token.slice(authenticationScheme.length, token.length);
      }
      const user = await validateAuthToken(token);
      req.user = user;
      console.log(user)
      next();
    } catch (error) {
      console.log(error)
      return res.status(401).json({
        msg: "You are not authorized to access this resource",
        success: false,
      });
    }
  } else {
    return res.status(401).json({
      msg: "You are not authorized to access this resource",
      success: false,
    });
  }
};

module.exports = { generateToken, verifyJWT };
