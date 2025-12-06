import Database from "better-sqlite3";
import { BufferJSON } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

export class SQLClient {
  private db: Database.Database;

  constructor(id: string) {
    const dataDir = path.resolve("./data", `id_${id}`);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const DB_FILE = path.join(dataDir, "auth_store.db");

    // Initialize database
    this.db = new Database(DB_FILE);

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS auth_data (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();
  }

  write(key: string, data: any) {
    const serialized = JSON.stringify(data, BufferJSON.replacer);
    this.db.prepare(`INSERT OR REPLACE INTO auth_data (key, value) VALUES (?, ?)`).run(key, serialized);
  }

  read<T = any>(key: string): T | null {
    const row = this.db.prepare(`SELECT value FROM auth_data WHERE key = ?`).get(key) as { value: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.value, BufferJSON.reviver);
  }

  remove(key: string) {
    this.db.prepare(`DELETE FROM auth_data WHERE key = ?`).run(key);
  }

  removeAll() {
    this.db.prepare(`DELETE FROM auth_data`).run();
  }

  close() {
    this.db.close();
  }
}
