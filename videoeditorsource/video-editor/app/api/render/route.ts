// Etapa 6 — Render final (Remotion → MP4).

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getProject, saveProject, setStage } from "@/lib/store";
import { renderProject } from "@/lib/render";

export const runtime = "nodejs";
export const maxDuration = 900;

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  const project = getProject(projectId);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  if (!project.analysis)
    return NextResponse.json({ error: "Analise o vídeo primeiro" }, { status: 400 });

  try {
    setStage(project.id, "reviewed");
    const outputPath = await renderProject(project);

    project.files.output = path.relative(process.cwd(), outputPath);
    project.stage = "rendered";
    saveProject(project);

    return NextResponse.json({
      project,
      outputUrl: `/api/video/${project.id}?which=output`,
    });
  } catch (err: any) {
    setStage(project.id, "error", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
