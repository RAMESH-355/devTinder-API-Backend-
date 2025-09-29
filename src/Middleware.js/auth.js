const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req,res,next) => {
    try{ 
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Token is not valid . Please ! Login once again "); 
        }
        const decodeObj = await jwt.verify(token,"Dev@tinder#132");
        const {_id} = decodeObj; 
        const user = await User.findById(_id);
        if (!user){
            throw new Error("User is not found");
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(400).send("ERROR: " + err.message);
    };
}

module.exports = userAuth;