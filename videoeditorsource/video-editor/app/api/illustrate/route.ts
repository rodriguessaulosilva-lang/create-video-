// Etapa 5 (revisão) — geração de ilustração IA sob demanda para uma cena.

import { NextRequest, NextResponse } from "next/server";
import { getProject, saveProject } from "@/lib/store";
import { generateIllustration } from "@/lib/images";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { projectId, sceneId, prompt } = await req.json();
  const project = getProject(projectId);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

  const scene = project.analysis?.scenes.find((s) => s.id === sceneId);
  if (!scene)
    return NextResponse.json({ error: "Cena não encontrada" }, { status: 404 });

  const finalPrompt = prompt || scene.imagePrompt;
  if (!finalPrompt)
    return NextResponse.json({ error: "Prompt de imagem ausente" }, { status: 400 });

  try {
    const { fileName } = await generateIllustration(project.id, sceneId, finalPrompt);
    scene.imagePrompt = finalPrompt;
    // URL servível pela rota de asset.
    scene.imageUrl = `/api/asset/${project.id}/${fileName}`;
    saveProject(project);
    return NextResponse.json({ project, imageUrl: scene.imageUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
