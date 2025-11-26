const express = require("express");
const authRouter = express.Router();

const { signupValidation } = require("../utils/Validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,        // because Render uses HTTPS
  sameSite: "None",    // allow cross-site (Vercel -> Render)
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

authRouter.post("/signup", async (req, res) => {
  try {
    // validation
    signupValidation(req);

    const { firstName, lastName, emailId, password } = req.body;

    // password encryption
    const passwordHash = await bcrypt.hash(password, 10);

    // storing data
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();

    const token = await user.getJWT();

    // create a cookie
    res
      .cookie("token", token, COOKIE_OPTIONS)
      .status(201)
      .json({
        success: true,
        message: "User info added successfully",
        data: savedUser,
      });
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }

    const token = await user.getJWT();

    // create a cookie
    res
      .cookie("token", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: user,
      });
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      ...COOKIE_OPTIONS,
      expires: new Date(0), // expire immediately
    });

    res.send("Logout Successfully");
  } catch (err) {
    return res.send("Logout Unsuccessfull: " + err.message);
  }
});

module.exports = authRouter;
