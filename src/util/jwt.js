const jwt = require("jsonwebtoken");

const { logger } = require("./logger");

async function authenticateToken(req, res, next) {
  // console.log("Protected route hit:", req.path);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log("TOKEN:", token);

  // demonstration purposes
  // const token = getToken();

  // const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "forbidden access" });
  } else {
    const user = await decodeJWT(token);
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(400).json({ message: "Bad JWT" });
    }
  }
}

async function decodeJWT(token) {
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

module.exports = {
  authenticateToken,
  decodeJWT,
};
