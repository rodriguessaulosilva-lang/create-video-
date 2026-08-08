// Utilitários de SRT (geração a partir das legendas).

import type { Legenda } from "./types";

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

/** segundos -> "HH:MM:SS,mmm" */
export function secondsToSrtTime(seconds: number): string {
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

export function legendasToSrt(legendas: Legenda[]): string {
  return legendas
    .map((leg, i) => {
      const idx = i + 1;
      const time = `${secondsToSrtTime(leg.start)} --> ${secondsToSrtTime(
        leg.end
      )}`;
      return `${idx}\n${time}\n${leg.text.trim()}\n`;
    })
    .join("\n");
}
