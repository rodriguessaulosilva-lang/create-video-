"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { PlayerRef } from "@remotion/player";
import type { Project } from "@/lib/types";
import { patchProject, runStep } from "@/lib/api";
import { SceneList } from "./SceneList";
import { Timeline } from "./Timeline";
import { Pipeline } from "./Pipeline";

// O preview usa @remotion/player e carrega a fonte no browser — importa
// client-only para não avaliar nada disso no SSR.
const Preview = dynamic(() => import("./Preview").then((m) => m.Preview), {
  ssr: false,
  loading: () => (
    <div className="glass-card flex aspect-[9/16] max-h-[70vh] items-center justify-center text-white/30">
      carregando preview…
    </div>
  ),
});

export function Editor({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState<Project>(initialProject);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave (debounced) das edições de cenas/paleta.
  const applyChange = useCallback(
    (patch: Partial<Project>) => {
      setProject((prev) => {
        const next = { ...prev, ...patch };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          patchProject(next.id, {
            analysis: next.analysis,
            name: next.name,
          }).catch(() => {});
        }, 600);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const seekFrame = (frame: number) => {
    playerRef.current?.seekTo(frame);
  };

  const doRender = async () => {
    setRendering(true);
    setRenderError(null);
    try {
      // Garante que as últimas edições foram salvas antes de renderizar.
      await patchProject(project.id, { analysis: project.analysis, name: project.name });
      const updated = await runStep("render", project.id);
      setProject(updated);
    } catch (e: any) {
      setRenderError(e.message);
    } finally {
      setRendering(false);
    }
  };

  const hasOutput = project.stage === "rendered" && project.files.output;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost px-3 py-2 text-sm">
            ←
          </Link>
          <div>
            <input
              value={project.name}
              onChange={(e) => applyChange({ name: e.target.value })}
              className="bg-transparent text-xl font-bold text-white focus:outline-none"
            />
            <p className="text-xs text-white/40">
              {project.width}×{project.height} · {project.fps}fps ·{" "}
              {project.analysis?.narrativeFormat ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasOutput && (
            <a
              href={`/api/video/${project.id}?which=output`}
              download={`${project.name}.mp4`}
              className="btn-ghost px-4 py-2 text-sm"
            >
              ⬇ Baixar MP4
            </a>
          )}
          <button
            onClick={doRender}
            disabled={rendering || !project.analysis}
            className="btn-gold px-5 py-2 text-sm"
          >
            {rendering ? "Renderizando…" : "🎥 Renderizar final"}
          </button>
        </div>
      </div>

      {renderError && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          Erro no render: {renderError}
        </p>
      )}

      {/* Layout: preview | (cenas + pipeline) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Preview lateral */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Preview project={project} playerRef={playerRef} />
          {hasOutput && (
            <div className="glass-card p-3 text-center text-sm text-green-300">
              ✓ Render concluído — assista pela aba de download ou pelo preview.
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div className="space-y-6">
          <Pipeline project={project} onUpdate={setProject} />
          <div>
            <h3 className="label mb-3">Cenas ({project.analysis?.scenes.length ?? 0})</h3>
            <SceneList project={project} onChange={applyChange} />
          </div>
        </div>
      </div>

      {/* Timeline embaixo */}
      {project.analysis && (
        <div className="mt-6">
          <Timeline project={project} onSeekFrame={seekFrame} />
        </div>
      )}
    </main>
  );
}
