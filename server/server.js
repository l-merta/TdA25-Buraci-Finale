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

app.get("/api/v1/", async (req, res) => {
  res.json({ message: "Hello from the API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    res.redirect(`/error?message=${encodeURIComponent(err.message || "An error occurred")}`);
  } else {
    res.status(500).json({ code: 500, message: err.message || "Internal Server Error" });
  }
});

// Obsluhuje všechny ostatní cesty a vrací hlavní HTML soubor
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});