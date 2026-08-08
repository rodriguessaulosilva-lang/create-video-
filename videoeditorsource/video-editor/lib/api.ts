// Cliente de API (usado pelos componentes client do editor).

import type { Project } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function uploadVideo(
  file: File,
  prompt?: string
): Promise<Project> {
  const fd = new FormData();
  fd.append("file", file);
  if (prompt) fd.append("prompt", prompt);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  return (await json<{ project: Project }>(res)).project;
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
  return (await json<{ project: Project }>(res)).project;
}

export async function patchProject(
  id: string,
  patch: Partial<Project>
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return (await json<{ project: Project }>(res)).project;
}

type StepRoute = "normalize" | "transcribe" | "analyze" | "render";

export async function runStep(
  step: StepRoute,
  projectId: string
): Promise<Project> {
  const res = await fetch(`/api/${step}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  return (await json<{ project: Project }>(res)).project;
}

export async function generateIllustration(
  projectId: string,
  sceneId: string,
  prompt?: string
): Promise<{ project: Project; imageUrl: string }> {
  const res = await fetch("/api/illustrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, sceneId, prompt }),
  });
  return json<{ project: Project; imageUrl: string }>(res);
}

export function videoUrl(
  id: string,
  which: "raw" | "normalized" | "output" = "normalized"
): string {
  return `/api/video/${id}?which=${which}`;
}
