const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {}; // Object to store rooms and their users

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle joining a room
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);

      if (!rooms[room]) {
        rooms[room] = [];
      }

      // Notify the user of the current room users
      io.to(room).emit("roomUsers", { users: rooms[room] });
    });

    // Handle setting a username
    socket.on("setUsername", ({ room, username }) => {
      if (rooms[room] && !rooms[room].includes(username)) {
        rooms[room].push(username);
      }

      // Notify all users in the room of the updated user list
      io.to(room).emit("roomUsers", { users: rooms[room] });
    });

    // Listen for chat messages
    socket.on("chatMessage", (data) => {
      console.log(`Message received: ${data.message}`);
      // Broadcast the message to all connected clients
      io.emit("chatMessage", { username: data.username, message: data.message });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      for (const room in rooms) {
        rooms[room] = rooms[room].filter((user) => user !== socket.username);

        // Notify the room of the updated user list
        io.to(room).emit("roomUsers", { users: rooms[room] });
      }

      console.log("A user disconnected");
    });
  });
};