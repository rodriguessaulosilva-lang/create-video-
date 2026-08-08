"use client";

import { useMemo } from "react";
import type { Project, SceneType } from "@/lib/types";
import { convertScenesFromLegendaIndex } from "@/lib/timing";

const TYPE_COLOR: Record<SceneType, string> = {
  intro: "#FFB800",
  statement: "#7c9cff",
  illustration: "#31d97b",
  quote: "#c084fc",
  list: "#38bdf8",
  bignumber: "#ff9d00",
  outro: "#ff5470",
};

export function Timeline({
  project,
  onSeekFrame,
}: {
  project: Project;
  onSeekFrame?: (frame: number) => void;
}) {
  const fps = project.fps;
  const duration = project.durationInSeconds ?? project.legendas.at(-1)?.end ?? 0;

  const scenes = useMemo(
    () =>
      convertScenesFromLegendaIndex(
        project.analysis?.scenes ?? [],
        project.legendas,
        fps,
        duration
      ),
    [project.analysis, project.legendas, fps, duration]
  );

  const totalFrames = Math.max(
    scenes.at(-1) ? scenes.at(-1)!.from + scenes.at(-1)!.durationInFrames : 1,
    1
  );

  return (
    <div className="glass-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Timeline</span>
        <span className="text-xs text-white/40">
          {duration.toFixed(1)}s · {scenes.length} cenas · {fps}fps
        </span>
      </div>

      {/* Faixa de cenas */}
      <div className="flex h-14 w-full gap-0.5 overflow-hidden rounded-lg">
        {scenes.map((s) => {
          const width = `${(s.durationInFrames / totalFrames) * 100}%`;
          return (
            <button
              key={s.id}
              onClick={() => onSeekFrame?.(s.from)}
              title={`${s.type} · leg #${s.startLeg} · ${(
                s.from / fps
              ).toFixed(1)}s`}
              className="group relative h-full shrink-0 overflow-hidden transition-all hover:brightness-125"
              style={{ width, background: `${TYPE_COLOR[s.type]}33` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: TYPE_COLOR[s.type] }}
              />
              <span className="absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-semibold text-white/70">
                {s.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Régua de legendas */}
      <div className="mt-2 flex h-2 w-full gap-px overflow-hidden rounded">
        {project.legendas.map((l) => (
          <div
            key={l.index}
            className="h-full flex-1 bg-white/10"
            title={`#${l.index}: ${l.text}`}
          />
        ))}
      </div>
    </div>
  );
}
