"use client";
import { useEffect, useState } from "react";

export default function WebSocketClient() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    const ws = new WebSocket("ws://165.22.89.24:8083");

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
