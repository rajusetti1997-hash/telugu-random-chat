const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// Waiting users queue
let waiting = null;

wss.on("connection", function connection(ws) {
  
  // If no one waiting, keep this user waiting
  if (!waiting) {
    waiting = ws;
    ws.send(JSON.stringify({ system: "Waiting for a partner..." }));
  } 
  else {
    // Match waiting user with new user
    ws.partner = waiting;
    waiting.partner = ws;

    ws.send(JSON.stringify({ system: "You are now connected!" }));
    waiting.send(JSON.stringify({ system: "You are now connected!" }));

    waiting = null;
  }

  // When user sends a message
  ws.on("message", function incoming(msg) {
    if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
      ws.partner.send(JSON.stringify({ message: msg.toString() }));
    }
  });

  // If user leaves
  ws.on("close", function () {
    if (ws.partner) {
      ws.partner.send(JSON.stringify({ system: "The other user left." }));
      ws.partner.partner = null;
    }
    if (waiting === ws) {
      waiting = null;
    }
  });
});
