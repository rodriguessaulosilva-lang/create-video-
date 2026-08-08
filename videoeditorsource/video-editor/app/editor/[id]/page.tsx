import { notFound } from "next/navigation";
import { getProject } from "@/lib/store";
import { Editor } from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default function EditorPage({ params }: { params: { id: string } }) {
  const project = getProject(params.id);
  if (!project) notFound();
  return <Editor initialProject={project} />;
}
