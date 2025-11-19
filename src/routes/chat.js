const express = require("express");
const userAuth = require("../Middleware.js/auth");
const { Chat } = require("../models/chat");
const mongoose = require("mongoose");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user?._id;

  if (!userId || !targetUserId) {
    return res.status(400).json({ error: "Missing userId or targetUserId" });
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ error: "Invalid targetUserId" });
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    }).lean();

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error("Chat fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});
module.exports = chatRouter;

/*
const express = require('express');
const userAuth = require('../Middleware.js/auth');
const Chat = require('../models/chat').Chat;

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {

    const { targetUserId } = req.params;
    const userId = req.user._id;

    try{
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate({
            path: 'messages.senderId',
            select: 'firstName lastName'
        });
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }
        res.json(chat);
    }
    catch (err){
        return res.status(400).send("Some thing went wrong");
    }

});

module.exports = chatRouter;

*/
