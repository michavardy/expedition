import WebSocketClient from "./WebSocketClient";

export default async function QRCodePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;  // <-- unwrap it
  
  console.log("resolvedParams:", resolvedParams); // logs on server/next dev terminal
  const id = resolvedParams.id;

  return (
    <div>
      <h1>QR Code Session: {id}</h1>
      <WebSocketClient id={id} />
    </div>
  );
}
