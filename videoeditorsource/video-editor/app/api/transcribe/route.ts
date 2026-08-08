// Etapa 3 — Transcrição (Whisper) + geração do SRT.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProject, saveProject, setStage } from "@/lib/store";
import { ensureProjectDir } from "@/lib/paths";
import { transcribe } from "@/lib/whisper";
import { legendasToSrt } from "@/lib/srt";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  const project = getProject(projectId);
  if (!project)
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

  const audio = project.files.audio || project.files.normalized || project.files.raw;
  if (!audio)
    return NextResponse.json({ error: "Nenhum áudio disponível" }, { status: 400 });

  try {
    const audioAbs = path.resolve(process.cwd(), audio);
    const { legendas, duration } = await transcribe(audioAbs);

    const dir = ensureProjectDir(project.id);
    const srtPath = path.join(dir, "captions.srt");
    fs.writeFileSync(srtPath, legendasToSrt(legendas), "utf-8");

    project.legendas = legendas;
    project.files.srt = path.relative(process.cwd(), srtPath);
    if (duration) project.durationInSeconds = duration;
    project.stage = "transcribed";
    saveProject(project);

    return NextResponse.json({ project });
  } catch (err: any) {
    setStage(project.id, "error", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
