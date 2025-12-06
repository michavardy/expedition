"use client";

import { useEffect, useState } from "react";

export default function WebSocketClient({ id }: { id: string }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3001/qr_code/${id}`);

    socket.onopen = () => {
      console.log("WS connected!");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);
        if (data.action === "emitQR") {
          setQr(data.qr);
        }
      } catch (err) {
        console.warn("Invalid JSON:", event.data);
      }
    };

    socket.onerror = (err) => {
      console.error("WS error", err);
    };

    socket.onclose = () => {
      console.warn("WS closed");
    };

    return () => socket.close();
  }, [id]);

  return (
    <div>
      {qr ? (
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            qr
          )}&size=200x200`}
          alt="WhatsApp QR Code"
        />
      ) : (
        "Connecting to WhatsApp session…"
      )}
    </div>
  );
}
