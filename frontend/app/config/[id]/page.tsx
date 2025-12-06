// app/config/[id]/page.tsx

import ConfigClient from "./ConfigClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;  // <-- unwrap it
  console.log("resolvedParams:", resolvedParams); // logs on server/next dev terminal
  const id = resolvedParams.id;

  return (
    <div>
      <ConfigClient userId={id} />
    </div>
  );
}
