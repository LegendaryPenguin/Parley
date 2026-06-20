import { SceneClient } from "@/components/scene/SceneClient";

// Next 16: params is a Promise. Server wrapper unwraps it, then hands the id to
// the client component that runs the conversation.
export default async function ScenePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SceneClient id={id} />;
}
