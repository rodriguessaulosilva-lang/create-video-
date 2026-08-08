// Etapa 4 — Análise (Claude). Gera formato narrativo, paleta e cenas (startLeg).

import { NextRequest, NextResponse } from "next/server";
import { getProject, saveProject, setStage } from "@/lib/store";
import { analyzeContent } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  const project = getProject(projectId);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  if (!project.legendas.length)
    return NextResponse.json({ error: "Transcreva o vídeo primeiro" }, { status: 400 });

  try {
    const analysis = await analyzeContent(project.legendas, project.prompt);
    project.analysis = analysis;
    if (analysis.title) project.name = analysis.title;
    project.stage = "analyzed";
    saveProject(project);
    return NextResponse.json({ project });
  } catch (err: any) {
    setStage(project.id, "error", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
