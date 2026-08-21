const messageModel = require("../model/message.js");
const { getSocketsByUserId } = require("../socket.js");

// ─── SEND A MESSAGE ─────────────────────────────────────────────────────────
// called when rider or driver sends a message
const sendMessage = async (req, res) => {
  const { receiverId, receiverName, receiverRole, content } = req.body;

  if (!receiverId || !receiverName || !receiverRole || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const message = await messageModel.create({
      sender: {
        id: req.user.id,
        name: req.user.userName,
        role: req.user.role,
      },
      receiver: {
        id: receiverId,
        name: receiverName,
        role: receiverRole,
      },
      content,
    });

    // notify receiver in real time via socket
    const io = req.app.get("io");
    const targetSockets = getSocketsByUserId(receiverId);
    const senderSockets = getSocketsByUserId(req.user.id);
    targetSockets.forEach((socketId) => {
      io.to(socketId).emit("newMessage", {
        message,
      });

      io.to(socketId).emit("newInbox", {
        person: message.sender,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      });
    });

    senderSockets.forEach((socketId) => {
      io.to(socketId).emit("newMessage", {
        message,
      });
      io.to(socketId).emit("newInbox", {
        person: message.receiver,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      });
    });

    return res.status(200).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET CHAT BETWEEN TWO USERS ─────────────────────────────────────────────
// returns all messages between the logged in user and another user
// sorted oldest to newest so chat appears top to bottom
const getChat = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await messageModel
      .find({
        $or: [
          { "sender.id": req.user.id, "receiver.id": userId },
          { "sender.id": userId, "receiver.id": req.user.id },
        ],
      })
      .sort({ createdAt: 1 }); // oldest first

    return res.status(200).json({
      message: "Chat fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET INBOX ───────────────────────────────────────────────────────────────
// returns a list of all people the logged in user has chatted with
// showing only the latest message from each conversation
const getInbox = async (req, res) => {
  try {
    // get all messages involving the logged in user
    const messages = await messageModel
      .find({
        $or: [{ "sender.id": req.user.id }, { "receiver.id": req.user.id }],
      })
      .sort({ createdAt: -1 }); // newest first

    // build inbox - one entry per unique conversation partner
    const inboxMap = {};

    messages.forEach((msg) => {
      // figure out who the OTHER person is in this message
      const issender = msg.sender.id.toString() === req.user.id.toString();
      const otherPerson = issender ? msg.receiver : msg.sender;
      const otherPersonId = otherPerson.id.toString();

      // only keep the first (newest) message per conversation partner
      if (!inboxMap[otherPersonId]) {
        inboxMap[otherPersonId] = {
          person: otherPerson,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
        };
      }
    });

    // convert map to array
    const inbox = Object.values(inboxMap);

    return res.status(200).json({
      message: "Inbox fetched successfully",
      data: inbox,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getChat,
  getInbox,
};
