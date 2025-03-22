const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {}; // Object to store rooms and their users

  const generateRoomCode = () => {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    } while (rooms[code]); // Ensure the code is unique
    return code;
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send the list of rooms to the admin panel
    const emitRoomsList = () => {
      const roomList = Object.keys(rooms).map((room) => ({
        code: room,
        userCount: Object.keys(rooms[room]).length,
      }));
      io.emit("roomsList", roomList);
    };

    // Handle creating a new room
    socket.on("createRoom", () => {
      const room = generateRoomCode(); // Generate a unique room code
      rooms[room] = {};
      console.log(`Room created: ${room}`);
      emitRoomsList(); // Update the list of rooms for all clients
    });

    // Handle deleting a room
    socket.on("deleteRoom", ({ room }) => {
      if (rooms[room]) {
        delete rooms[room];
        console.log(`Room deleted: ${room}`);
        emitRoomsList(); // Update the list of rooms for all clients
      }
    });

    // Handle joining a room
    socket.on("joinRoom", ({ room }) => {
      if (!rooms[room]) {
        socket.emit("error", { code: 404, message: "Room does not exist" });
        return;
      }

      socket.join(room);

      if (!rooms[room][socket.id]) {
        rooms[room][socket.id] = { username: `User${Math.floor(1000 + Math.random() * 9000)}` };
      }

      // Notify all users in the room of the updated user list
      io.to(room).emit("roomUsers", { users: Object.values(rooms[room]) });
      emitRoomsList(); // Update the list of rooms for all clients
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
      emitRoomsList(); // Update the list of rooms for all clients
    });
  });
};