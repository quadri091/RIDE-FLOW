const express = require("express");

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connect = require("./database/database.js");
const router = require("./routes/form.js");
const setupSignaling = require("./signal.js");

//
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // ← attach socket.io to http server
  cors: { origin: "*" }, // allow your frontend to connect
});

//
const port = 8000;
connect();

app.use(express.json({ limit: "100mb" }));

app.use(cors());
app.use("/", router);

// passing io
setupSignaling(io);
//

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
