// ===========================================================================
// Sistema de timing por índice de legenda (startLeg).
//
// A IA NÃO calcula frames. Ela só diz em qual legenda cada cena começa
// (startLeg = índice da legenda). Este módulo converte esses índices em
// frames exatos, calculando a duração de cada cena a partir do início da
// cena seguinte (ou do fim do vídeo, para a última).
// ===========================================================================

import type { Legenda, Scene, TimedScene } from "./types";

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Retorna o frame inicial de uma legenda pelo seu índice.
 * Se o índice for inválido, faz clamp para o intervalo válido.
 */
export function legendaIndexToFrame(
  legendas: Legenda[],
  index: number,
  fps: number
): number {
  if (legendas.length === 0) return 0;
  const clamped = Math.max(0, Math.min(index, legendas.length - 1));
  return secondsToFrames(legendas[clamped].start, fps);
}

/**
 * Converte cenas (com startLeg) em cenas com frames exatos (from + durationInFrames).
 *
 * Regras:
 *  - Ordena as cenas por startLeg.
 *  - A primeira cena sempre começa no frame 0 (garante que não há buraco no início).
 *  - `from` de cada cena = frame da legenda em startLeg.
 *  - `durationInFrames` = from da próxima cena - from desta cena.
 *  - A última cena vai até o fim do vídeo (totalDurationInFrames).
 *  - Cada cena tem no mínimo `minSceneFrames` de duração.
 */
export function convertScenesFromLegendaIndex(
  scenes: Scene[],
  legendas: Legenda[],
  fps: number,
  totalDurationInSeconds: number,
  minSceneFrames = fps // 1 segundo mínimo
): TimedScene[] {
  if (scenes.length === 0) return [];

  const totalFrames = Math.max(
    secondsToFrames(totalDurationInSeconds, fps),
    minSceneFrames
  );

  // Ordena por startLeg preservando a ordem de empate.
  const sorted = [...scenes].sort((a, b) => a.startLeg - b.startLeg);

  // Frame inicial de cada cena.
  const starts = sorted.map((scene, i) => {
    const raw = legendaIndexToFrame(legendas, scene.startLeg, fps);
    // A primeira cena começa em 0 para não deixar buraco na abertura.
    return i === 0 ? 0 : raw;
  });

  // Garante ordem monotônica crescente (evita cenas sobrepostas por dados ruins).
  for (let i = 1; i < starts.length; i++) {
    if (starts[i] <= starts[i - 1]) {
      starts[i] = starts[i - 1] + minSceneFrames;
    }
  }

  return sorted.map((scene, i) => {
    const from = starts[i];
    const nextStart = i < sorted.length - 1 ? starts[i + 1] : totalFrames;
    const durationInFrames = Math.max(minSceneFrames, nextStart - from);
    return { ...scene, from, durationInFrames };
  });
}

/**
 * Duração total do vídeo em frames — a partir das legendas (fim da última)
 * ou de um fallback.
 */
export function totalFramesFromLegendas(
  legendas: Legenda[],
  fps: number,
  fallbackSeconds = 0
): number {
  if (legendas.length === 0) return secondsToFrames(fallbackSeconds, fps);
  const lastEnd = legendas[legendas.length - 1].end;
  return secondsToFrames(Math.max(lastEnd, fallbackSeconds), fps);
}
