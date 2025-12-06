import { WebSocketServer } from "ws";
import { WhatsAppClient } from "./waClient.ts";

function extractId(url?: string | null): string {
  if (!url) {
    throw new Error("Missing URL");
  }

  // Should begin with "/qr_code/"
  const parts = url.split("/"); // ["", "qr_code", "<id>"]

  if (parts.length !== 3) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  const [, prefix, id] = parts;

  if (prefix !== "qr_code") {
    throw new Error(`Invalid prefix '${prefix}', expected 'qr_code'`);
  }

  if (!id || id.trim() === "") {
    throw new Error("Missing ID in URL");
  }

  return id;
}

async function main() {
  const wss = new WebSocketServer({ port: 3001 })
  wss.on("connection", (ws, request) => {
  const id: string = extractId(request.url);
  console.log("New WS connection with id:", id);
  const whatsAppClient = new WhatsAppClient(ws, id);
  });

}

main()
