const jwt = require("jsonwebtoken");
const usermodel = require("./model/form-model.js");

const userSocket = [];

const lifeUpdate = (io) => {
  io.on("connection", async (socket) => {
    const { token } = socket.handshake.query;

    if (!token || typeof token !== "string" || !token.trim()) {
      return socket.disconnect(true);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.jwtSecretKey);
    } catch (err) {
      return socket.disconnect(true);
    }

    let user;
    try {
      user = await usermodel.findOne({ email: decoded.email });
    } catch (err) {
      return socket.disconnect(true);
    }

    if (!user) {
      return socket.disconnect(true);
    }

    const userId = user.id.toString();

    userSocket.push({
      userId,
      role: user.role.toLowerCase(),
      name: user.userName,
      socketId: socket.id,
    });

    if (["admin", "superadmin"].includes(user.role.toLowerCase())) {
      socket.join("admins");
    }
    if (user.role.toLowerCase() != "driver") {
      socket.join("getDrivers");
    }
    if (user.role.toLowerCase() == "driver") {
      socket.join("drivers");
    }
    if (user.role.toLowerCase() == "superadmin") {
      socket.join("super");
    }

    // trip room
    socket.on("joinTrip", (matchCode) => {
      socket.join(matchCode);
    });

    socket.on("driverLocation", ({ matchCode, lat, lng }) => {
      io.to(matchCode).emit("locationUpdate", { lat, lng });
    });

    //. create call part

    socket.on("call", ({ targetUserId, offer }) => {
      const targetSockets = getSocketsByUserId(targetUserId);

      if (targetSockets.length === 0) {
        // target is offline
        socket.emit("callFailed", { message: "User is not available" });
        return;
      }

      const caller = userSocket.find((u) => u.socketId === socket.id);
      const callerName = caller ? caller.name : "Unknown";

      targetSockets.forEach((socketId) => {
        io.to(socketId).emit("incomingCall", {
          callerId: userId,
          callerName,
          offer,
        });
      });
    });

    // answer call
    socket.on("answerCall", ({ targetUserId, answer }) => {
      const targetSockets = getSocketsByUserId(targetUserId);
      targetSockets.forEach((socketId) => {
        io.to(socketId).emit("callAnswered", { answer });
      });
    });

    // Step 3 - both sides exchange ICE candidates
    // sender sends: { targetUserId: otherPersonsId, candidate }
    socket.on("iceCandidate", ({ targetUserId, candidate }) => {
      const targetSockets = getSocketsByUserId(targetUserId);
      targetSockets.forEach((socketId) => {
        io.to(socketId).emit("iceCandidate", { candidate });
      });
    });

    // sender sends: { targetUserId: otherPersonsId }
    socket.on("endCall", ({ targetUserId }) => {
      const targetSockets = getSocketsByUserId(targetUserId);
      targetSockets.forEach((socketId) => {
        io.to(socketId).emit("callEnded");
      });
    });
    //

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
      const userIndex = userSocket.findIndex(
        (u) => u.userId === userId && u.socketId === socket.id,
      );
      if (userIndex !== -1) {
        userSocket.splice(userIndex, 1);
      }
    });
  });
};

// get all socket ids belonging to one specific user (handles multi-tab/device)
const getSocketsByUserId = (userId) =>
  userSocket
    .filter((u) => u.userId === userId.toString())
    .map((u) => u.socketId);

// get all socket ids belonging to a set of roles (e.g. ["admin", "super_admin"])
const getSocketsByRole = (roles) =>
  userSocket.filter((u) => roles.includes(u.role)).map((u) => u.socketId);

module.exports = { lifeUpdate, getSocketsByUserId, getSocketsByRole };
