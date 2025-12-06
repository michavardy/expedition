import { getClientsDict, removeClient } from "../src/clientManager.ts";
import { WhatsAppClient } from "../src/waClient.ts";

// Get all current clients
const clients = getClientsDict();

for (const [id, client] of Object.entries(clients)) {
  console.log(`🔄 Restarting client ${id}`);
  // Close current client
  removeClient(id);
  // Reinstantiate
  new WhatsAppClient(null as any, id);
}

console.log("✅ All clients restarted.");
