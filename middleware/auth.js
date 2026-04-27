const jwt = require("jsonwebtoken");
const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token is required" });
    const jwtVerify = await jwt.verify(token, process.env.jwtSecretKey);
    if (!jwtVerify) return res.status(400).json({ message: "Invalid Token" });
    console.log(jwtVerify);

    const find = await model.findOne({ email: jwtVerify.email });
    if (!find) return res.status(400).json({ message: "User not found" });
    req.user = find;
    next();
  } catch (error) {
    console.log(error);

    return res.status(400).json({ message: "Token verification failed" });
  }
};

module.exports = authMiddleWare;
