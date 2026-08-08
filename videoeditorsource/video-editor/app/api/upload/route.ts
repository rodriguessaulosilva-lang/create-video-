// Etapa 1 — Upload. Recebe o MP4 bruto (+ prompt opcional), cria o projeto,
// salva o arquivo e faz o probe inicial.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createProject, saveProject } from "@/lib/store";
import { ensureProjectDir } from "@/lib/paths";
import { probe } from "@/lib/ffmpeg";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const prompt = (form.get("prompt") as string) || undefined;
  const name = (form.get("name") as string) || undefined;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }

  const project = createProject({
    name: name || file.name.replace(/\.[^.]+$/, ""),
    prompt,
  });

  const dir = ensureProjectDir(project.id);
  const rawPath = path.join(dir, "raw.mp4");
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(rawPath, buffer);

  project.files.raw = path.relative(process.cwd(), rawPath);
  project.stage = "uploaded";

  // Probe (best-effort) para já ter duração/resolução.
  try {
    const info = await probe(rawPath);
    project.durationInSeconds = info.durationInSeconds;
  } catch {
    // ffmpeg pode falhar em ambientes sem os binários — segue mesmo assim.
  }

  saveProject(project);
  return NextResponse.json({ project });
}
