const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../Middleware.js/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth , async(req,res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const connectionRequestInfo = new connectionRequest({
            fromUserId,toUserId,status
        });

        const allowedStatus = ["ignored", "interested"] ; 

        if (!allowedStatus.includes(status)) {
            return res.status(400).send("Invalid status type " + status);
        }

        const toUser = await User.findById(toUserId); 
        if (!toUser) {
            return res.status(400).json({message: "user not found ! "});
        }

        const isConnectionExists = await connectionRequest.findOne({
            $or : [
                {fromUserId:fromUserId, toUserId: toUserId},
                {fromUserId:toUserId, toUserId: fromUserId}
            ],
        }); 
    
        if (isConnectionExists){
            return res.status(400).json({message : "Connection already exists !!!"});
        }

        const data = await connectionRequestInfo.save();

        if (status === "interested") {
            res.json({message: "Connection sent successfully",
            data });
        }
        else if(status === "ignored"){
            res.json({message: "Profile ignored successfully",
            data });
        }
}

    catch(err) {
        return res.status(500).json({ message: "ERROR: " + err.message });
    }
}); 

requestRouter.post("/request/review/:status/:requestId", userAuth , async(req,res) => {
    try{
        const loggedInUser = req.user;
        
        const { status , requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"] 

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Invalid status type"});
        }

        const connectionRequestInfo = await connectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequestInfo){
            return res.status(400).json({message: "No connection request sent" });
        }

        connectionRequestInfo.status = status; 

        const data =  await connectionRequestInfo.save(); 

        res.json({message: "Connection request " + status , data});
    }
    catch(err) {
        return res.status(500).json({ message: "ERROR: " + err.message });
    }
});

module.exports = requestRouter;