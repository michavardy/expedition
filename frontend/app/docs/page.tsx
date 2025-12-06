// app/docs/page.tsx
export default function DocsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <iframe
        src="http://127.0.0.1:3002/api/docs"
        title="Swagger Docs"
        style={{
          width: "100%",
          height: "90vh",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}
