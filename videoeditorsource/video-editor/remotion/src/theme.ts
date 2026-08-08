// Carrega a fonte Sora (Google Fonts) e utilitários de estilo.

import { loadFont } from "@remotion/google-fonts/Sora";
import type { Palette, Sentiment } from "./types";

// Carrega os pesos usados no projeto: 400 / 600 / 700 / 800.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
});

/** Cor de uma palavra na legenda TikTok, conforme o sentimento. */
export function sentimentColor(
  sentiment: Sentiment | undefined,
  palette: Palette
): string {
  switch (sentiment) {
    case "positive":
      return "#31d97b"; // verde
    case "negative":
      return "#ff5470"; // vermelho/rosa
    case "emphasis":
      return palette.primary; // dourado/acento
    default:
      return palette.text;
  }
}

export const SORA = fontFamily;
