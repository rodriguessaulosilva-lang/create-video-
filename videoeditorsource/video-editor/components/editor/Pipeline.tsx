"use client";

import { useState } from "react";
import type { PipelineStage, Project } from "@/lib/types";
import { runStep } from "@/lib/api";

interface Step {
  key: "normalize" | "transcribe" | "analyze" | "render";
  n: number;
  label: string;
  desc: string;
  /** Stage que indica que este passo já foi concluído. */
  done: PipelineStage;
  /** Stages a partir das quais este passo pode rodar. */
  ready: PipelineStage[];
}

const STEPS: Step[] = [
  {
    key: "normalize",
    n: 2,
    label: "Normalização",
    desc: "HEVC → H.264 CFR 30fps + extração de áudio",
    done: "normalized",
    ready: ["uploaded", "normalized", "transcribed", "analyzed", "reviewed", "rendered"],
  },
  {
    key: "transcribe",
    n: 3,
    label: "Transcrição",
    desc: "Whisper → legendas com timestamps",
    done: "transcribed",
    ready: ["normalized", "transcribed", "analyzed", "reviewed", "rendered"],
  },
  {
    key: "analyze",
    n: 4,
    label: "Análise IA",
    desc: "Claude → formato, paleta e cenas",
    done: "analyzed",
    ready: ["transcribed", "analyzed", "reviewed", "rendered"],
  },
  {
    key: "render",
    n: 6,
    label: "Render final",
    desc: "Remotion → MP4 1080×1920",
    done: "rendered",
    ready: ["analyzed", "reviewed", "rendered"],
  },
];

const ORDER: PipelineStage[] = [
  "created",
  "uploaded",
  "normalized",
  "transcribed",
  "analyzed",
  "reviewed",
  "rendered",
];

function stageIndex(s: PipelineStage): number {
  const i = ORDER.indexOf(s);
  return i < 0 ? 0 : i;
}

export function Pipeline({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (p: Project) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: Step["key"]) => {
    setBusy(key);
    setError(null);
    try {
      const updated = await runStep(key, project.id);
      onUpdate(updated);
    } catch (e: any) {
      setError(`${key}: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const runAll = async () => {
    setError(null);
    for (const step of STEPS.filter((s) => s.key !== "render")) {
      if (stageIndex(project.stage) >= stageIndex(step.done)) continue;
      setBusy(step.key);
      try {
        const updated = await runStep(step.key, project.id);
        onUpdate(updated);
        project = updated;
      } catch (e: any) {
        setError(`${step.key}: ${e.message}`);
        break;
      }
    }
    setBusy(null);
  };

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Pipeline</h3>
        <button
          onClick={runAll}
          disabled={!!busy || project.stage === "created"}
          className="btn-gold px-4 py-2 text-sm"
        >
          {busy ? "Processando…" : "⚡ Rodar até a revisão"}
        </button>
      </div>

      <div className="space-y-2">
        {STEPS.map((step) => {
          const isDone = stageIndex(project.stage) >= stageIndex(step.done);
          const canRun = step.ready.includes(project.stage) && !busy;
          const isBusy = busy === step.key;
          return (
            <div
              key={step.key}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  isDone
                    ? "bg-green-500/20 text-green-300"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {isDone ? "✓" : step.n}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="truncate text-xs text-white/40">{step.desc}</p>
              </div>
              <button
                onClick={() => run(step.key)}
                disabled={!canRun}
                className="btn-ghost shrink-0 px-3 py-1.5 text-xs"
              >
                {isBusy ? "…" : isDone ? "Refazer" : "Rodar"}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {project.stage === "error" && project.error && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {project.error}
        </p>
      )}
    </div>
  );
}
