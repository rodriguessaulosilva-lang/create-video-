// ===========================================================================
// Render final via Remotion (@remotion/bundler + @remotion/renderer).
// Faz o bundle do projeto Remotion isolado, seleciona a composição MainVideo,
// injeta as props (cenas com timing resolvido) e renderiza um MP4.
// ===========================================================================

import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { MainVideoProps, Project } from "./types";
import { convertScenesFromLegendaIndex, totalFramesFromLegendas } from "./timing";
import { projectFile } from "./paths";

const REMOTION_ENTRY = path.resolve(process.cwd(), "remotion", "src", "index.ts");
const COMPOSITION_ID = "MainVideo";

let cachedBundle: string | null = null;

async function getBundle(): Promise<string> {
  if (cachedBundle) return cachedBundle;
  cachedBundle = await bundle({
    entryPoint: REMOTION_ENTRY,
    // Webpack override para o Tailwind do Remotion, se necessário, entra aqui.
  });
  return cachedBundle;
}

export function buildMainVideoProps(project: Project): MainVideoProps {
  const fps = project.fps;
  const duration =
    project.durationInSeconds ??
    (project.legendas.at(-1)?.end ?? 0);

  const scenes = convertScenesFromLegendaIndex(
    project.analysis?.scenes ?? [],
    project.legendas,
    fps,
    duration
  );

  return {
    width: project.width,
    height: project.height,
    fps,
    // Para render, o áudio é lido do arquivo normalizado via caminho absoluto.
    audioSrc: project.files.normalized
      ? path.resolve(process.cwd(), project.files.normalized)
      : undefined,
    legendas: project.legendas,
    scenes,
    palette: project.analysis?.palette!,
  };
}

export async function renderProject(project: Project): Promise<string> {
  const serveUrl = await getBundle();
  const inputProps = buildMainVideoProps(project) as unknown as Record<
    string,
    unknown
  >;

  // A duração/dimensões corretas vêm do calculateMetadata da composição,
  // que deriva a duração das cenas já com timing resolvido.
  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps,
  });

  const outputLocation = projectFile(project.id, "output.mp4");

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
  });

  return outputLocation;
}
