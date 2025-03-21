const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for chat messages
    socket.on("chatMessage", (data) => {
      console.log(`Message received: ${data.message}`);
      // Broadcast the message to all connected clients
      io.emit("chatMessage", { username: data.username, message: data.message });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};