// signaling.js

const setupSignaling = (io) => {
  // This is our online users phonebook
  // It lives in memory — resets when server restarts
  const onlineUsers = {};

  io.on("connection", (socket) => {
    // A new user connected — but we don't know who yet
    // We wait for them to "register" with their email
    console.log("Someone connected:", socket.id);

    // ─── Step 2a: User registers their email ──────────────
    // When the frontend loads, it emits "register" with the
    // logged in user's email. We save it here so we can find
    // them later when someone wants to call them.

    // after — saves socket id AND user info
    socket.on("register", ({ email, userName, number }) => {
      onlineUsers[email] = {
        socketId: socket.id,
        userName,
        number,
      };
      socket.email = email;
      console.log(`${email} is online`);
    });

    // ─── Step 2b: Caller wants to call someone ────────────
    // The caller emits "call-user" with the target's email and
    // their WebRTC offer. We look up the target's socket id
    // from our phonebook and forward the offer to them.
    // If the target is not online, we tell the caller.
    socket.on("call-user", ({ to, offer }) => {
      const receiver = onlineUsers[to];

      if (!receiver) {
        // Target user is not online
        socket.emit("user-offline");
        return;
      }

      const caller = onlineUsers[socket.email];

      // Forward the call to the receiver
      io.to(receiver.socketId).emit("incoming-call", {
        from: socket.email,
        offer,
        callerName: caller.userName,
        callerNumber: caller.number,
      });
    });

    // ─── Step 2c: Receiver answers the call ───────────────
    // The receiver accepted the call and created an answer.
    // We forward that answer back to the original caller
    // so they can complete the WebRTC handshake.
    socket.on("call-answered", ({ to, answer }) => {
      const caller = onlineUsers[to];

      if (caller) {
        io.to(caller.socketId).emit("call-answered", { answer });
      }
    });

    // ─── Step 2d: ICE candidates ──────────────────────────
    // After offer/answer, both sides need to exchange network
    // information (ICE candidates) to find the best path to
    // connect to each other. We just forward them.
    // This happens multiple times back and forth.
    socket.on("ice-candidate", ({ to, candidate }) => {
      const target = onlineUsers[to];

      if (target) {
        io.to(target.socketId).emit("ice-candidate", { candidate });
      }
    });

    // ─── Step 2e: End the call ────────────────────────────
    // When one user hangs up, we notify the other person
    // so their UI can update and their mic can be stopped.
    socket.on("end-call", ({ to }) => {
      const target = onlineUsers[to];

      if (target) {
        io.to(target.socketId).emit("call-ended");
      }
    });

    // ─── Step 2f: User disconnects ────────────────────────
    // When the user closes the tab or loses connection,
    // we remove them from our phonebook automatically.
    socket.on("disconnect", () => {
      if (socket.email) {
        delete onlineUsers[socket.email];
        console.log(`${socket.email} went offline`);
      }
    });
  });
};

module.exports = setupSignaling;
