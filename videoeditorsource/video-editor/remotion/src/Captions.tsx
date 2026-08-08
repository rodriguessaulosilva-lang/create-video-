import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Legenda, Palette } from "./types";
import { sentimentColor, SORA } from "./theme";

// Legendas estilo TikTok: palavra-por-palavra, palavra ativa com "pop" (spring)
// e cor por sentimento. Mostra a legenda atual (segmento) e destaca a palavra
// que está sendo falada no frame corrente.

function findActiveLegenda(legendas: Legenda[], time: number): Legenda | null {
  for (const leg of legendas) {
    if (time >= leg.start - 0.05 && time <= leg.end + 0.1) return leg;
  }
  return null;
}

export const Captions: React.FC<{
  legendas: Legenda[];
  palette: Palette;
  fps: number;
}> = ({ legendas, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const leg = findActiveLegenda(legendas, time);
  if (!leg) return null;

  const words = leg.words.length
    ? leg.words
    : leg.text.split(/\s+/).map((w, i) => ({
        text: w,
        start: leg.start,
        end: leg.end,
        sentiment: "neutral" as const,
      }));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 360,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px 18px",
          maxWidth: 900,
        }}
      >
        {words.map((w, i) => {
          const isActive = time >= w.start - 0.02 && time <= w.end + 0.08;
          const isPast = time > w.end + 0.08;

          // "pop" da palavra quando ela começa a ser falada.
          const enter = spring({
            frame: frame - Math.round(w.start * fps),
            fps,
            config: { damping: 14, stiffness: 200, mass: 0.5 },
            durationInFrames: 12,
          });
          const scale = isActive ? interpolate(enter, [0, 1], [0.7, 1.18]) : 1;
          const color = isActive
            ? sentimentColor(w.sentiment, palette)
            : isPast
            ? palette.text
            : palette.muted;

          return (
            <span
              key={i}
              style={{
                fontFamily: SORA,
                fontWeight: isActive ? 800 : 700,
                fontSize: 76,
                lineHeight: 1.05,
                color,
                transform: `scale(${scale})`,
                textShadow: "0 6px 24px rgba(0,0,0,0.75)",
                WebkitTextStroke: isActive ? "2px rgba(0,0,0,0.35)" : "0",
                transition: "none",
                letterSpacing: "-0.5px",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
