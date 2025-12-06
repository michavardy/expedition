"use client";
import { useEffect, useState } from "react";

export default function WebSocketClient() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:3001");

    ws.onopen = () => {
      console.log("Connected to WS");
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      setMessage(event.data); // update state with message from server
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setMessage("WebSocket error");
    };

    return () => ws.close();
  }, []);

  return <h1>{message}</h1>; // render message
}
