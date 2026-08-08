import path from "path";
import fs from "fs";

/** Raiz de dados (configurável via DATA_DIR). */
export function dataRoot(): string {
  const dir = process.env.DATA_DIR || "./data";
  return path.resolve(process.cwd(), dir);
}

export function projectsDir(): string {
  return path.join(dataRoot(), "projects");
}

export function projectDir(id: string): string {
  return path.join(projectsDir(), id);
}

export function projectFile(id: string, name: string): string {
  return path.join(projectDir(id), name);
}

/** Garante que um diretório existe (criação recursiva). */
export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function ensureProjectDir(id: string): string {
  const dir = projectDir(id);
  ensureDir(dir);
  return dir;
}
