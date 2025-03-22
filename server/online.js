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

  const generateUserId = () => {
    let id;
    do {
      id = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Generate a 10-digit code
    } while (Object.values(rooms).some((room) => Object.values(room.users).some((user) => user.id === id))); // Ensure the id is unique
    return id;
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
        presenters: [], // List of presenters
        currentPresenterIndex: -1, // Index of the current presenter
        presenterReady: false, // Ready status of the current presenter
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
          id: generateUserId(), // Generate a unique 10-digit id
          username: "Zaměstnanec",
          role: "spectator", // Default role
        };
      }

      // Send the user's id back to the client
      socket.emit("userId", { id: rooms[room].users[socket.id].id });

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
        const roomData = rooms[room];
        roomData.roomStarted = true; // Update the room status

        // Create a shuffled list of presenters
        roomData.presenters = Object.values(roomData.users)
          .filter((user) => user.role === "presenter")
          .sort(() => Math.random() - 0.5);

        roomData.currentPresenterIndex = 0; // Start with the first presenter
        roomData.presenterReady = false; // Reset presenter ready status

        // Notify all users of the room status and the first presenter
        io.to(room).emit("roomStatus", { roomStarted: true });
        io.to(room).emit("currentPresenter", {
          presenter: roomData.presenters[0],
          presenterReady: roomData.presenterReady,
        });

        console.log(`Room ${room} started by admin.`);
      }
    });

    // Handle presenter ready event
    socket.on("presenterReady", ({ room }) => {
      const roomData = rooms[room];
      if (roomData) {
        roomData.presenterReady = true; // Mark the current presenter as ready

        // Notify all users of the presenter's ready status
        io.to(room).emit("currentPresenter", {
          presenter: roomData.presenters[roomData.currentPresenterIndex],
          presenterReady: roomData.presenterReady,
        });
      }
    });

    // Handle moving to the next presenter (admin-only action)
    socket.on("nextPresenter", ({ room }) => {
      const roomData = rooms[room];
      if (roomData && admins[room] === socket.id) {
        roomData.presenterReady = false; // Reset ready status
        roomData.currentPresenterIndex += 1; // Move to the next presenter

        if (roomData.currentPresenterIndex < roomData.presenters.length) {
          // Notify all users of the next presenter
          io.to(room).emit("currentPresenter", {
            presenter: roomData.presenters[roomData.currentPresenterIndex],
            presenterReady: roomData.presenterReady,
          });
        } else {
          // All presenters have presented
          io.to(room).emit("allPresentersDone", { message: "All presenters have finished." });
          console.log(`All presenters in room ${room} have finished.`);
        }
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