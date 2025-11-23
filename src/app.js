const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDB = require("./Config/database");
const User = require("./models/user");
const cors = require("cors");

const http = require("http");
const server = http.createServer(app);

require("dotenv").config();

/*
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://devtinder-web-3yd2.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

initializeSocket(server);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

app.get('/', (req, res) => {
  res.send('Backend is running successfully');
});

app.get('/api', (req, res) => {
  res.send('API Route is working');
});


app.get("/user", async (req,res) => {

    const userEmail = req.body.emailId;

        try{

        const Information = await User.findOne({emailId : userEmail});
        
        if (Information.length === 0 ) {
            res.send("Userdata not found");
        }
        else {
            
            res.send(Information);
        }
        
    }
    catch (err){
        return res.status(400).send("Some thing went wrong");
    }

});

app.get("/feed", async (req,res) => {
 
        try{ 

        const Information = await User.find({});
        
        if (Information.length === 0 ) {
            res.send("Userdata not found");
        }
        else {
            
            res.send(Information);
        }
        
    }
    catch (err){
        return res.status(400).send("Some thing went wrong");
    }

});

app.delete("/userdataDelete", async(req,res) => {
    const userID = req.body.userId;
    try{
        const userStatus = await User.findByIdAndDelete({ _id: userID });
        res.send("data deleted successfully");
    }
     catch (err){
        return res.status(400).send("Some thing went wrong");
    }
    
});

app.patch("/update/:userId", async(req,res) => {

    const userID = req.params.userId;
    const userData = req.body;

    try{
        const Allowed_updates = ["photoURL","skills", "about","age"]

        isUpdatesAloowed = Object.keys(userData).every((k) => Allowed_updates.includes(k));

        if (!isUpdatesAloowed) {
            throw new Error("Update is not allowed");
        }

        if (userData?.skills.length > 10) {
            throw new Error("Skills can not br more than 10");
        }

        const userUpdate = await User.findByIdAndUpdate({ _id: userID }, userData,{ returnDocument : 'after',
            runValidators : true
         } );
        res.send("data updated successfully");
    }
     catch (err){
        return res.status(400).send("Update failed: " + err.message);
    }
    
});

connectDB()
    .then(() => {
            console.log("Database connected successfully");
            server.listen(process.env.PORT,'0.0.0.0',() => {
                console.log("Server sent an request, successfully!");
            });
    }
    
    )
    .catch((err) => {
            console.log("Database connection failed ",err.message);
            process.exit(1);
        });