const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {}; // Object to store rooms and their users
  const admins = {}; // Object to track admins connected to rooms

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
        userCount: Object.keys(rooms[room].users).length,
        roomStarted: rooms[room].roomStarted,
      }));
      io.emit("roomsList", roomList);
    };

    // Handle creating a new room
    socket.on("createRoom", () => {
      const room = generateRoomCode(); // Generate a unique room code
      rooms[room] = {
        users: {}, // Users in the room
        roomStarted: false, // Room status
      };
      console.log(`Room created: ${room}`);
      emitRoomsList(); // Update the list of rooms for all clients
    });

    // Handle deleting a room
    socket.on("deleteRoom", ({ room }) => {
      if (rooms[room]) {
        delete rooms[room];
        if (admins[room]) delete admins[room];
        console.log(`Room deleted: ${room}`);
        emitRoomsList(); // Update the list of rooms for all clients
      }
    });

    // Handle joining a room as a participant
    socket.on("joinRoom", ({ room }) => {
      if (!rooms[room]) {
        socket.emit("error", { code: 404, message: "Room does not exist" });
        return;
      }

      socket.join(room);

      if (!rooms[room].users[socket.id]) {
        rooms[room].users[socket.id] = {
          username: `User${Math.floor(1000 + Math.random() * 9000)}`,
          role: "spectator", // Default role
        };
      }

      // Notify all users in the room of the updated user list
      io.to(room).emit("roomUsers", { users: Object.values(rooms[room].users) });

      // Send the room status to the user
      socket.emit("roomStatus", { roomStarted: rooms[room].roomStarted });
      emitRoomsList(); // Update the list of rooms for all clients
    });

    // Handle joining a room as an admin
    socket.on("joinRoomAsAdmin", ({ room }) => {
      if (!rooms[room]) {
        socket.emit("error", { code: 404, message: "Room does not exist" });
        return;
      }

      socket.join(room);
      admins[room] = socket.id; // Track the admin for this room
      console.log(`Admin connected to room: ${room}`);

      // Immediately send the current user list and room status to the admin
      socket.emit("roomUsers", { users: Object.values(rooms[room].users) });
      socket.emit("roomStatus", { roomStarted: rooms[room].roomStarted });
    });

    // Handle setting or updating a username and role
    socket.on("updateUser", ({ room, username, role }) => {
      if (rooms[room] && rooms[room].users[socket.id]) {
        if (username) rooms[room].users[socket.id].username = username;
        if (role) rooms[room].users[socket.id].role = role;

        // Notify all users in the room of the updated user list
        io.to(room).emit("roomUsers", { users: Object.values(rooms[room].users) });
      }
    });

    // Handle starting the room (admin-only action)
    socket.on("startRoom", ({ room }) => {
      if (admins[room] === socket.id) {
        rooms[room].roomStarted = true; // Update the room status
        io.to(room).emit("roomStatus", { roomStarted: true }); // Notify all users
        console.log(`Room ${room} started by admin.`);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      for (const room in rooms) {
        if (rooms[room].users[socket.id]) {
          delete rooms[room].users[socket.id]; // Remove the user from the room

          // Notify the room of the updated user list
          io.to(room).emit("roomUsers", { users: Object.values(rooms[room].users) });

          console.log(`User ${socket.id} disconnected from room ${room}`);
        }

        // Remove admin if they disconnect
        if (admins[room] === socket.id) {
          delete admins[room];
          console.log(`Admin disconnected from room ${room}`);
        }
      }
      emitRoomsList(); // Update the list of rooms for all clients
    });
  });
};