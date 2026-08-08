// ===========================================================================
// Storage simples baseado em filesystem.
// Cada projeto vive em data/projects/<id>/project.json + arquivos de mídia.
// Suficiente para dev / single-node; troque por um DB em produção.
// ===========================================================================

import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  ensureProjectDir,
  projectFile,
  projectsDir,
  ensureDir,
} from "./paths";
import { VIDEO_DEFAULTS, type Project, type PipelineStage } from "./types";

const PROJECT_JSON = "project.json";

function nowISO(): string {
  return new Date().toISOString();
}

export function createProject(input: {
  name?: string;
  prompt?: string;
}): Project {
  const id = uuidv4();
  ensureProjectDir(id);
  const project: Project = {
    id,
    name: input.name?.trim() || "Novo projeto",
    stage: "created",
    prompt: input.prompt,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    width: VIDEO_DEFAULTS.width,
    height: VIDEO_DEFAULTS.height,
    fps: VIDEO_DEFAULTS.fps,
    files: {},
    legendas: [],
  };
  saveProject(project);
  return project;
}

export function saveProject(project: Project): Project {
  ensureProjectDir(project.id);
  project.updatedAt = nowISO();
  fs.writeFileSync(
    projectFile(project.id, PROJECT_JSON),
    JSON.stringify(project, null, 2),
    "utf-8"
  );
  return project;
}

export function getProject(id: string): Project | null {
  try {
    const raw = fs.readFileSync(projectFile(id, PROJECT_JSON), "utf-8");
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

/** Aplica um patch parcial e persiste. */
export function updateProject(
  id: string,
  patch: Partial<Project>
): Project | null {
  const project = getProject(id);
  if (!project) return null;
  const updated: Project = { ...project, ...patch, id: project.id };
  return saveProject(updated);
}

export function setStage(
  id: string,
  stage: PipelineStage,
  error?: string
): Project | null {
  return updateProject(id, { stage, error: error ?? undefined });
}

export function listProjects(): Project[] {
  const dir = projectsDir();
  ensureDir(dir);
  const ids = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  return ids
    .map((id) => getProject(id))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function deleteProject(id: string): boolean {
  try {
    fs.rmSync(projectFile(id, ""), { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export { uuidv4 };
