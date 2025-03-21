const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 5200;

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON bodies
app.use(express.static("public")); // Slouží statické soubory z Reactu

// Create HTTP server
const server = http.createServer(app);

// Import and use WebSocket server
require("./online")(server);

// Use CORS middleware
app.use(cors());

// Serve static files
app.use(express.static("public"));

// API route for testing
app.get("/api", (req, res) => {
  res.json({ api: "Chat Application" });
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});