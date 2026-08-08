// Etapa 2 — Normalização. Converte HEVC/qualquer coisa para H.264 CFR 30fps
// e extrai o áudio para a transcrição.

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getProject, saveProject, setStage } from "@/lib/store";
import { ensureProjectDir } from "@/lib/paths";
import { extractAudio, normalizeToH264, probe } from "@/lib/ffmpeg";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  const project = getProject(projectId);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  if (!project.files.raw)
    return NextResponse.json({ error: "Nenhum vídeo bruto" }, { status: 400 });

  try {
    const dir = ensureProjectDir(project.id);
    const rawAbs = path.resolve(process.cwd(), project.files.raw);
    const normalizedAbs = path.join(dir, "normalized.mp4");
    const audioAbs = path.join(dir, "audio.wav");

    await normalizeToH264(rawAbs, normalizedAbs, project.fps);
    await extractAudio(normalizedAbs, audioAbs);

    const info = await probe(normalizedAbs);

    project.files.normalized = path.relative(process.cwd(), normalizedAbs);
    project.files.audio = path.relative(process.cwd(), audioAbs);
    project.durationInSeconds = info.durationInSeconds;
    project.stage = "normalized";
    saveProject(project);

    return NextResponse.json({ project });
  } catch (err: any) {
    setStage(project.id, "error", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
