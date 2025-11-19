const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid. Please login again.",
      });
    }

    const decoded = jwt.verify(token, "Dev@tinder#132");

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = userAuth;
