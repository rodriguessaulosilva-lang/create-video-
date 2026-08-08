"use client";

import { useState } from "react";
import type { Project, Scene, SceneType } from "@/lib/types";
import { generateIllustration } from "@/lib/api";

const TYPE_META: Record<SceneType, { icon: string; label: string }> = {
  intro: { icon: "🎬", label: "Intro" },
  statement: { icon: "💬", label: "Frase" },
  illustration: { icon: "🖼️", label: "Ilustração" },
  quote: { icon: "❝", label: "Citação" },
  list: { icon: "📋", label: "Lista" },
  bignumber: { icon: "🔢", label: "Número" },
  outro: { icon: "🏁", label: "Encerramento" },
};

export function SceneList({
  project,
  onChange,
  onSelectScene,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
  onSelectScene?: (scene: Scene) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const scenes = project.analysis?.scenes ?? [];

  const updateScene = (id: string, patch: Partial<Scene>) => {
    const next = scenes.map((s) => (s.id === id ? { ...s, ...patch } : s));
    onChange({ analysis: { ...project.analysis!, scenes: next } });
  };

  const illustrate = async (scene: Scene) => {
    setBusyId(scene.id);
    try {
      const { project: updated } = await generateIllustration(
        project.id,
        scene.id,
        scene.imagePrompt
      );
      onChange(updated);
    } catch (e: any) {
      alert(`Falha ao gerar ilustração: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  if (!project.analysis) {
    return (
      <div className="glass-card p-6 text-center text-white/40">
        As cenas aparecem aqui após a etapa de análise.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scenes.map((scene, i) => {
        const meta = TYPE_META[scene.type];
        return (
          <div
            key={scene.id}
            className="glass-card p-4 transition-all hover:border-gold/20"
            onClick={() => onSelectScene?.(scene)}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <span className="text-sm font-semibold text-white">
                  {i + 1}. {meta.label}
                </span>
              </div>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/40">
                leg #{scene.startLeg}
              </span>
            </div>

            {/* Campos editáveis conforme o tipo */}
            {("title" in scene || scene.type !== "list") && (
              <input
                value={scene.title ?? ""}
                onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Título"
                className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none"
              />
            )}

            {(scene.type === "statement" ||
              scene.type === "quote" ||
              scene.type === "outro") && (
              <textarea
                value={scene.text ?? ""}
                onChange={(e) => updateScene(scene.id, { text: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Texto"
                rows={2}
                className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none"
              />
            )}

            {scene.type === "bignumber" && (
              <div className="mb-2 flex gap-2">
                <input
                  value={scene.number ?? ""}
                  onChange={(e) => updateScene(scene.id, { number: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="87%"
                  className="w-24 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
                />
                <input
                  value={scene.numberLabel ?? ""}
                  onChange={(e) =>
                    updateScene(scene.id, { numberLabel: e.target.value })
                  }
                  onClick={(e) => e.stopPropagation()}
                  placeholder="dos apostadores perdem"
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
                />
              </div>
            )}

            {scene.type === "list" && (
              <textarea
                value={(scene.items ?? []).join("\n")}
                onChange={(e) =>
                  updateScene(scene.id, {
                    items: e.target.value.split("\n").filter(Boolean),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                placeholder="Um item por linha"
                rows={3}
                className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none"
              />
            )}

            {scene.type === "illustration" && (
              <div className="mt-2">
                {scene.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={scene.imageUrl}
                    alt=""
                    className="mb-2 aspect-[2/3] w-24 rounded-lg object-cover"
                  />
                )}
                <textarea
                  value={scene.imagePrompt ?? ""}
                  onChange={(e) =>
                    updateScene(scene.id, { imagePrompt: e.target.value })
                  }
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Prompt da ilustração (em inglês para melhor resultado)"
                  rows={2}
                  className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    illustrate(scene);
                  }}
                  disabled={busyId === scene.id}
                  className="btn-ghost w-full py-2 text-sm"
                >
                  {busyId === scene.id
                    ? "Gerando…"
                    : scene.imageUrl
                    ? "🔄 Regerar ilustração"
                    : "✨ Gerar ilustração IA"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
