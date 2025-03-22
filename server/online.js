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
    console.log("A user connected:", socket.id);

    // Handle joining a room
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);

      if (!rooms[room]) {
        rooms[room] = {};
      }

      // Add the user to the room with a default username
      rooms[room][socket.id] = { username: `User${Math.floor(1000 + Math.random() * 9000)}` };

      // Notify all users in the room of the updated user list
      io.to(room).emit("roomUsers", { users: Object.values(rooms[room]) });
    });

    // Handle setting or updating a username
    socket.on("username", ({ room, username }) => {
      if (rooms[room] && rooms[room][socket.id]) {
        rooms[room][socket.id].username = username;

        // Notify all users in the room of the updated user list
        io.to(room).emit("roomUsers", { users: Object.values(rooms[room]) });
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      for (const room in rooms) {
        if (rooms[room][socket.id]) {
          delete rooms[room][socket.id]; // Remove the user from the room

          // Notify the room of the updated user list
          io.to(room).emit("roomUsers", { users: Object.values(rooms[room]) });

          console.log(`User ${socket.id} disconnected from room ${room}`);
        }
      }
    });
  });
};