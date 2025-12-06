import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SQLClient } from "./sqlClient.ts";
import { SQLMetadata } from "./sqlMetadata.js";

//import { clientManager, getClient, removeClient } from "./clientManager.ts";
//import { SQLClient } from "./sqlClient.ts";

//// --- ESM __dirname fix ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//
//// --- DATA_DIR ---
const DATA_DIR = path.resolve(__dirname, "../data");


console.log("DATA_DIR:", DATA_DIR);
console.log("Existing IDs:", fs.readdirSync(DATA_DIR).join(", "));

const app = express();
// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "WhatsApp API",
    version: "1.0.0",
    description: "API for WhatsApp client management",
  },
  servers: [
    {
      url: "http://localhost:3002",
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ["./src/api.ts"], // path to your API file(s) with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.json());
//
//// --- Helpers ---
function getDbPath(user_id: string) {
    return path.join(DATA_DIR, `id_${user_id}`, "auth_store.db");
}
//
//// --- Endpoints ---

app.get("/api/health_check", (req, res) => {
    res.json({ status: "ok" });
})
//
//// Check connection
app.get("/api/connection/:user_id", (req, res) => {
    const { user_id } = req.params;
    console.log(`user_id: ${user_id}, data_dir: ${DATA_DIR}, ids available: ${fs.readdirSync(DATA_DIR).join(", ")}`);
    const exists = fs.existsSync(getDbPath(user_id));
    res.json({ connected: exists });
});
//
//// Disconnect (remove DB)
app.delete("/api/connection/:user_id", (req, res) => {
    if (fs.existsSync(getDbPath(req.params.user_id))) {
        fs.rmSync(path.dirname(getDbPath(req.params.user_id)), { recursive: true, force: true });
        console.log(`Deleted data for user_id: ${req.params.user_id}`);
    }
    res.json({ success: true });
});
//
//// Set trigger endpoint
app.post("/api/set_trigger_endpoint/:user_id", (req, res) => {
    const { user_id } = req.params;
    const { trigger_endpoint } = req.body;

    if (!trigger_endpoint)
        return res.status(400).json({ error: "trigger_endpoint required" });

    try {
        const meta = new SQLMetadata(user_id);
        meta.write("trigger_endpoint", trigger_endpoint);
        meta.close();
    } catch (err) {
        console.error("Error writing trigger_endpoint:", err);
        return res.status(500).json({ error: "Failed to set trigger endpoint" });
    }

    res.json({ success: true, trigger_endpoint });
});

//// Get chats
//app.get("/api/chats/:user_id", (req, res) => {
//    const client = getClient(req.params.user_id);
//    if (!client) return res.status(404).json({ error: "Client not connected" });
//    res.json({ chats: client.getChats?.() || [] });
//});
//
//// Send message
//app.post("/message/:user_id", (req, res) => {
//    const client = getClient(req.params.user_id);
//    if (!client) return res.status(404).json({ error: "Client not connected" });
//
//    const { chat_name, message } = req.body;
//    if (!chat_name || !message) return res.status(400).json({ error: "chat_name and message required" });
//
//    try {
//        client.sendMessage?.(chat_name, message);
//    } catch (err) {
//        console.error("Error sending message:", err);
//        return res.status(500).json({ error: "Failed to send message" });
//    }
//
//    res.json({ success: true });
//});
//
//// Get groups
//app.get("/groups/:user_id", (req, res) => {
//    const client = getClient(req.params.user_id);
//    if (!client) return res.status(404).json({ error: "Client not connected" });
//    res.json({ groups: client.getGroups?.() || [] });
//});

// Start API
try {
    app.listen(3002, () => console.log("API server running on port 3002"));
} catch (err) {
    console.error("Failed to start API server:", err);
}
