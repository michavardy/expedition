import { proto } from "@whiskeysockets/baileys/WAProto/index.js";
import { initAuthCreds } from "@whiskeysockets/baileys/lib/Utils/auth-utils.js";
import type { AuthenticationCreds, SignalDataTypeMap, AuthenticationState } from "@whiskeysockets/baileys";
import { SQLClient } from "./sqlClient.ts";

export async function useSQLiteAuthState(id: string) {
  const db = new SQLClient(id);

  let creds: AuthenticationCreds;
  const existing = db.read("creds");

  if (existing) creds = existing;
  else {
    creds = initAuthCreds();
    db.write("creds", creds);
  }

  const get: AuthenticationState["keys"]["get"] = async (type, ids) => {
    const result: any = {};
    for (const keyId of ids) {
      const storeKey = `${type}-${keyId}`;
      let value = db.read(storeKey);
      if (!value) continue;
      if (type === "app-state-sync-key") value = proto.Message.AppStateSyncKeyData.fromObject(value);
      result[keyId] = value;
    }
    return result;
  };

  const set: AuthenticationState["keys"]["set"] = async data => {
    for (const category in data) {
      const group = data[category as keyof SignalDataTypeMap];
      if (!group) continue;
      for (const keyId in group) {
        const value = group[keyId];
        const storeKey = `${category}-${keyId}`;
        if (value) db.write(storeKey, value);
        else db.remove(storeKey);
      }
    }
  };

  return {
    state: { creds, keys: { get, set } },
    saveCreds: async () => {
      db.write("creds", creds);
      console.log("💾 Creds saved to SQLite");
    },
    close: () => db.close(),
  };
}
