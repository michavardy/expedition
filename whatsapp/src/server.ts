import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001, host: "0.0.0.0" });

wss.on("listening", () => {
  console.log("WebSocket server is listening on ws://0.0.0.0:3001");
});

wss.on("connection", (ws) => {
  console.log("Client connected!");
  ws.send("hello world");
  ws.on("message", (msg) => {
    console.log("Received message from client:", msg.toString());
  });
});

wss.on("error", (err) => {
  console.error("WebSocket server error:", err);
});
