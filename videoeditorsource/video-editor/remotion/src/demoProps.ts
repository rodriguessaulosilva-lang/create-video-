// Props de demonstração para o Remotion Studio (npm run studio).
// Não são usadas no render real (a app injeta as props verdadeiras).

import { DEFAULT_PALETTE, type MainVideoProps } from "./types";

export const demoProps: MainVideoProps = {
  width: 1080,
  height: 1920,
  fps: 30,
  audioSrc: undefined,
  palette: DEFAULT_PALETTE,
  legendas: [
    {
      index: 0,
      text: "Você gasta horas editando vídeo toda semana",
      start: 0,
      end: 2.6,
      words: [
        { text: "Você", start: 0, end: 0.4, sentiment: "neutral" },
        { text: "gasta", start: 0.4, end: 0.8, sentiment: "neutral" },
        { text: "HORAS", start: 0.8, end: 1.4, sentiment: "emphasis" },
        { text: "editando", start: 1.4, end: 2.0, sentiment: "neutral" },
        { text: "vídeo", start: 2.0, end: 2.6, sentiment: "neutral" },
      ],
    },
    {
      index: 1,
      text: "Isso acaba agora",
      start: 2.6,
      end: 4.2,
      words: [
        { text: "Isso", start: 2.6, end: 3.0, sentiment: "neutral" },
        { text: "acaba", start: 3.0, end: 3.6, sentiment: "positive" },
        { text: "agora", start: 3.6, end: 4.2, sentiment: "emphasis" },
      ],
    },
  ],
  scenes: [
    {
      id: "s1",
      type: "intro",
      startLeg: 0,
      from: 0,
      durationInFrames: 78,
      title: "Edição automática",
      subtitle: "com IA, do bruto ao pronto",
    },
    {
      id: "s2",
      type: "bignumber",
      startLeg: 1,
      from: 78,
      durationInFrames: 48,
      number: "10x",
      numberLabel: "mais rápido",
    },
  ],
};
