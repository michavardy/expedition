import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import { useSQLiteAuthState } from "./SQLiteAuth.ts";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger.js";
import type { WebSocket } from "ws";
import type { Boom } from "@hapi/boom";

const logger = MAIN_LOGGER.child({});
const RETRY_DELAY = 1000;
const MAX_RETRIES = 5;

export class WhatsAppClient {
    private id: string;
    private ws: WebSocket;
    private qr?: string;
    private retries = 0;

    constructor(ws: WebSocket, id: string) {
        this.id = id;
        this.ws = ws;
        void this.connect();
    }
    getChats(){}
    getGroups(){}
    sendMessage(chat_name: string, message: string) {}
    private async connect() {
        const { state, saveCreds } = await useSQLiteAuthState(this.id);

        const sock = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: false,
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qr = qr;
                this.ws.send(JSON.stringify({ id: this.id, action: "emitQR", qr }));
            }

            if (connection === "open") {
                console.log(`connection open: ${this.id}`);
                this.ws.send(JSON.stringify({ action: "statusUpdate", status: "open" }));
                this.retries = 0; // reset retry count
            }

            if (connection === "close") {
                let reason: number | undefined;
                //this.qr = undefined;

                if (lastDisconnect?.error && "output" in lastDisconnect.error) {
                    reason = (lastDisconnect.error as Boom).output.statusCode;
                }

                console.log(`❌ Connection closed: ${lastDisconnect?.error?.message || reason}`);

                if (reason === DisconnectReason.loggedOut) {
                    console.log("⚠️ Logged out, user must re-scan QR");
                } else if (
                    (reason === DisconnectReason.restartRequired || !reason) &&
                    this.retries < MAX_RETRIES
                ) {
                    this.retries++;
                    console.log(`🔄 Reconnecting in ${RETRY_DELAY}ms (${this.retries}/${MAX_RETRIES})`);

                    setTimeout(() => {
                        void this.connect();
                    }, RETRY_DELAY);
                } else {
                    console.log("❌ Max retries reached. Stopping.");
                }
            }
        });

        sock.ev.on("messages.upsert", (m) => {
            console.log("📩 New message:", JSON.stringify(m));
            // send to endpoint

        });
    }
}
