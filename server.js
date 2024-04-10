const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '')));

// Serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Function to send reload signal to clients
let reloadClients = [];
const sendReloadSignal = () => {
  reloadClients.forEach((client) => {
    client.res.write('data: reload\n\n');
  });
  reloadClients = [];
};

// Route for clients to listen for reload signal
app.get('/reload', (req, res) => {
  req.socket.setTimeout(Number.MAX_VALUE);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
  reloadClients.push({ req, res });
});

// Watch for file changes using fs.watch
fs.watch(path.join(__dirname, ''), { recursive: true }, (eventType, filename) => {
  console.log(`File ${filename} changed. Reloading...`);
  sendReloadSignal();
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
