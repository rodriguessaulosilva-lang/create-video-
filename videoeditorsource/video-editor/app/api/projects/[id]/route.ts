import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProject, updateProject } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = getProject(params.id);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  return NextResponse.json({ project });
}

// Atualização parcial — usada pelo editor ao editar cenas / paleta / etc.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patch = await req.json().catch(() => ({}));
  // Nunca deixa o cliente sobrescrever o id.
  delete patch.id;
  const project = updateProject(params.id, patch);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = deleteProject(params.id);
  return NextResponse.json({ ok });
}
