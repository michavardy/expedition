"use client";

import { useState, useEffect } from "react";

interface ConfigClientProps {
  userId: string;
}

export default function ConfigClient({ userId }: ConfigClientProps) {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "loading"
  >("loading");

  const [loadingAction, setLoadingAction] = useState(false);
  const [triggerEndpoint, setTriggerEndpoint] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  //
  // --- FETCH STATUS ---
  //
useEffect(() => {
  async function fetchStatus() {
    console.log("Fetching status for userId:", userId);
    setStatus("loading");
    try {
      const res = await fetch(`http://localhost:3002/api/connection/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch status");

      const data = await res.json();
      // Map boolean to your status string
      setStatus(data.connected ? "connected" : "disconnected");
    } catch (err) {
      console.error(err);
      setStatus("disconnected");
    }
  }

  fetchStatus();
}, [userId]);

  //
  // --- DISCONNECT ---
  //
  async function handleDisconnect() {
    setLoadingAction(true);
    try {
      const res = await fetch(
        `http://localhost:3002/api/connection/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to disconnect");

      setStatus("disconnected");
    } catch (err) {
      console.error(err);
      alert("Failed to disconnect");
    } finally {
      setLoadingAction(false);
    }
  }

  //
  // --- SAVE TRIGGER ENDPOINT ---
  //
  async function handleSaveTrigger() {
    if (!triggerEndpoint.trim()) {
      alert("Trigger endpoint cannot be empty");
      return;
    }

    setSaveLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3002/api/set_trigger_endpoint/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger_endpoint: triggerEndpoint }),
        }
      );

      if (!res.ok) throw new Error("Failed to save trigger endpoint");

      alert("Trigger endpoint saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save trigger endpoint");
    } finally {
      setSaveLoading(false);
    }
  }

  //
  // --- TEST TRIGGER ---
  //
  async function handleTestTrigger() {
    if (!triggerEndpoint.trim()) {
      alert("Trigger endpoint cannot be empty");
      return;
    }

    setTestLoading(true);

    try {
      // For now, this just hits the endpoint, you can modify logic later
      const res = await fetch(triggerEndpoint, { method: "POST" });

      if (!res.ok) throw new Error("Failed test trigger");

      alert("Trigger endpoint responded OK");
    } catch (err) {
      console.error(err);
      alert("Trigger endpoint failed");
    } finally {
      setTestLoading(false);
    }
  }

  //
  // --- RENDER ---
  //
  return (
    <div className="mt-6 p-4 border rounded max-w-lg">
      {status === "loading" ? (
        <p>Loading status...</p>
      ) : (
        <>
          <p className="mb-4 text-lg">
            Status:{" "}
            <strong
              className={
                status === "connected" ? "text-green-600" : "text-red-600"
              }
            >
              {status}
            </strong>
          </p>

          {status === "connected" && (
            <button
              onClick={handleDisconnect}
              disabled={loadingAction}
              className="px-4 py-2 mb-6 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loadingAction ? "Disconnecting..." : "Disconnect"}
            </button>
          )}

          <div className="mt-4">
            <h2 className="font-semibold mb-2">Trigger Endpoint</h2>

            <input
              type="text"
              placeholder="http://127.0.0.1:8000/trigger"
              value={triggerEndpoint}
              onChange={(e) => setTriggerEndpoint(e.target.value)}
              className="border px-3 py-2 w-full rounded mb-3"
            />

            <button
              onClick={handleSaveTrigger}
              disabled={saveLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-3"
            >
              {saveLoading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handleTestTrigger}
              disabled={testLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900 disabled:opacity-50"
            >
              {testLoading ? "Testing..." : "Test"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
