const express = require("express");
const userAuth = require("../Middleware.js/auth");
const User = require("../models/user");
const connectionRequest = require("../models/connectionRequest");

const userRouter = express.Router(); 

const USER_SAFE_DATA = "firstName lastName age photoURL skills gender about"

/*

userRouter.get("/user/requests/received",userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user; 

    const connectionRequests = await connectionRequest.find({
        toUserId: loggedInUser._id,
        status: "interested"
    }).populate("fromUserId", ["firstName", "lastName", "photoURL", "age", "gender", "about"]);

    if (!connectionRequests || connectionRequests.length === 0) {
    return res.json({ message: "No connection requests", connectionRequests: [] });
}

    res.json({
        message: "Data fetched successfully",
        connectionRequests
    });
    }
    catch (err) {
        return res.status(400).json({message: "ERROR: Some thing went wrong " });
    }
}); 
*/

userRouter.get("/user/requests/received", userAuth, async (req,res) => {
  try{
      const loggedInUser = req.user; 

      const connectionRequests = await connectionRequest.find({
          toUserId: loggedInUser._id,
          status: "interested"
      }).populate("fromUserId", ["firstName","lastName","photoURL","age","gender","about"]);

      if (!connectionRequests || connectionRequests.length === 0) {
          return res.json({ message: "No connection requests", connectionRequests: [] });
      }

      res.json({
          message: "Data fetched successfully",
          connectionRequests
      });
  } catch (err) {
      return res.status(400).json({message: "ERROR: Something went wrong " });
  }
});


userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const userConnections = await connectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" }
      ]
    })
    .populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA);   // <-- correct second populate

    if (!userConnections || userConnections.length === 0) {
      return res.json({ data: [] });
    }

    const data = userConnections.map(row => {
      // Return the other user in the connection
      return row.fromUserId._id.toString() === loggedInUser._id.toString()
        ? row.toUserId
        : row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "ERROR: " + err.message });
  }
});


/*
userRouter.get("/user/connections",userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user; 

    const userConnections = await connectionRequest.find({
        $or: [
            {toUserId: loggedInUser._id, status: "interested"},
            {fromUserId: loggedInUser._id, status: "interested"}
        ]
    }).populate("fromUserId", USER_SAFE_DATA)
      .populate("fromUserId", USER_SAFE_DATA);


    if (!userConnections) {
        return res.send("No connection requests"); 
    }

    const data = userConnections.map((row) => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString()){
            return row.toUserId;
        }
        return row.fromUserId;
    });

        res.json({ data });
    }
    catch (err) {
        return res.status(400).send( "ERROR: " + err.message );
    }
}); 
*/

userRouter.get("/user/feed",userAuth, async (req,res) => {
    try {
        const loggedInUser = req.user; 

        const page = parseInt(req.query.page) || 1 
        let limit = parseInt(req.query.limit) || 10 
        limit = limit > 50 ? 50 : limit ;
        const skip = (page - 1) * limit ; 


        const connectionRequests = await connectionRequest.find({
            $or : [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser},
            ],
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set(); 

        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString()); 
        });

        const users = await User.find({
            $and: [
                {_id: {$nin : Array.from(hideUsersFromFeed)}},
                {_id: {$ne: loggedInUser._id }}
            ]
        }).select(USER_SAFE_DATA).limit(limit).skip(skip);

        res.send(users);
        
    }
    catch(err) {
        return res.status(400).send( "ERROR: " + err.message );
    }
});

module.exports = userRouter;
