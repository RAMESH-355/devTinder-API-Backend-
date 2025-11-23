const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initializeSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });


    io.on("connection", (socket) => {
        console.log("New socket connected:", socket.id);


        socket.on("joinChat", ({ userId, targetUserId }) => {
            if (!userId || !targetUserId) {
                console.error("Missing userId / targetUserId in joinChat");
                return;
            }

            const roomId = getSecretRoomId(userId, targetUserId);
            socket.join(roomId);

            console.log(`User ${userId} joined room ${roomId}`);
        });

        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
            try {
                if (!userId || !targetUserId || !text) {
                    console.error("Missing data in sendMessage");
                    return;
                }

                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(`Message from ${userId}: "${text}"`);


                // 1. Find chat
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] },
                });

                // 2. Create chat if not exists
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    });
                }

                // 3. Push new message
                chat.messages.push({
                    senderId: userId,
                    text,
                });

                await chat.save();


                // 4. Emit to room
                io.to(roomId).emit("messageReceived", {
                    firstName,
                    lastName,
                    text,
                });

            } catch (err) {
                console.error("Error processing sendMessage:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔌 Socket disconnected:", socket.id);
        });

    });
};


module.exports = initializeSocket;



/*
const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");


const getSecretRoomId = (userId, targetUserId) => {

    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: { 
            origin: "http://localhost:5173",
        }
    }); 

    io.on("connection", (socket) => {
        socket.on("joinChat", ({firstName,userId,targetUserId}) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " joined the chat: " + roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({firstName, lastName, userId, targetUserId, text}) => {

            // To save message to database, emit event to other user in the room
            try{
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(firstName + " " + text);

                

                const isFriends = await ConnectionRequest.findOne({
                    fromUserId: userId,
                    toUserId: targetUserId,
                    status: "accepted"
                });

                if (!isFriends) {
                    console.error("Users are not friends. Messages will not be sent.");
                    return;
                }
                

                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] },
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    });
                }

                chat.messages.push({ 
                    senderId: userId, 
                    text, 
                });
                
                await chat.save();

                io.to(roomId).emit("messageReceived", { firstName, lastName, text});
                
            }
            catch(err){
                console.error("Error saving message to database:", err);
            }

        });

        socket.on("disconnect", () => {});
    });
};

module.exports = initializeSocket;

*/