import { WhatsAppClient } from "./WhatsAppClient.ts";
import fs from "fs";
import path from "path";

// Internal in-memory map
const clientMap = new Map<string, WhatsAppClient>();
const DATA_DIR = "data"; // base folder for id_<id>/auth_store.db

// --- Public API ---

/**
 * Get a client by id, lazy-load from auth store if not in memory.
 */
export function getClient(id: string): WhatsAppClient | undefined {
  if (clientMap.has(id)) return clientMap.get(id);

  const authDbPath = path.join(DATA_DIR, `id_${id}`, "auth_store.db");
  if (fs.existsSync(authDbPath)) {
    console.log(`🟢 Reconstructing client from auth_store: ${id}`);
    const client = new WhatsAppClient(null as any, id);
    clientMap.set(id, client);
    return client;
  }

  return undefined;
}

/**
 * Add a new client to memory
 */
export function addClient(id: string, client: WhatsAppClient) {
  clientMap.set(id, client);
}

/**
 * Remove a client from memory and close it
 */
export function removeClient(id: string) {
  const client = clientMap.get(id);
  if (client) client.close?.();
  clientMap.delete(id);
}

/**
 * Reconnect all clients that have auth stores but are not in memory
 */
export function reconnectAllClients(): string[] {
  const reconnectedIds: string[] = [];
  if (!fs.existsSync(DATA_DIR)) return reconnectedIds;

  const ids = fs.readdirSync(DATA_DIR)
    .filter(d => d.startsWith("id_"))
    .map(d => d.replace("id_", ""));

  for (const id of ids) {
    if (!clientMap.has(id)) {
      console.log(`⚡ Re-instantiating client for id: ${id}`);
      const client = new WhatsAppClient(null as any, id);
      clientMap.set(id, client);
      reconnectedIds.push(id);
    }
  }

  return reconnectedIds;
}

/**
 * Expose clients as a plain object for external scripts
 */
export function getClientsDict(): Record<string, WhatsAppClient> {
  const dict: Record<string, WhatsAppClient> = {};
  clientMap.forEach((client, id) => {
    dict[id] = client;
  });
  return dict;
}
