const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../Middleware.js/auth");
const { validateEditProfile } = require("../utils/Validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth , async(req,res) => {
    try {
        const user = req.user;
        return res.send(user);
    }
    catch (err){
        return res.status(400).send("ERROR: " + err.message);
    }

});

profileRouter.patch("/profile/edit", userAuth, async(req,res) => {
    try{
        if (!validateEditProfile(req)) {
            return res.status(400).send("Invalid Edit Request");
        }
        const loggedInUser = req.user;

        Object.keys(req.body).forEach((field) => loggedInUser[field] = req.body[field]); 

        await loggedInUser.save();

        return res.json({message: "${loggedInUser.firstName}, your profile has been updated successfully",
            data: loggedInUser});
    }
    catch (err){
        return res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch("/profile/passwordChange", userAuth, async(req,res) => {
    try{
        const {emailId , password, newPassword} = req.body;

        const loggedInUser = await User.findOne({ emailId: emailId});

        if (!loggedInUser) {
            throw new Error("ERROR: Not a valid Id"); 
        }

        const isValidUser = await loggedInUser.validatePassword(password);

        if (!isValidUser){
            throw new Error("ERROR: Existing password is not matching");
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword,10);

        loggedInUser.password = hashedNewPassword;

        await loggedInUser.save();

        return res.send("Password changed successfully");

    }
    catch (err) {
        return res.send("ERROR: " + err.message);
    }

});

module.exports = profileRouter;