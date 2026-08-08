// ===========================================================================
// Tipos compartilhados entre a app Next.js e (por espelhamento) o Remotion.
// O projeto Remotion é isolado e mantém sua própria cópia em remotion/src/types.ts
// — mantenha os dois em sincronia ao alterar o formato das props.
// ===========================================================================

export type PipelineStage =
  | "created"
  | "uploaded"
  | "normalized"
  | "transcribed"
  | "analyzed"
  | "reviewed"
  | "rendered"
  | "error";

/** Sentimento de uma palavra — controla a cor da legenda estilo TikTok. */
export type Sentiment = "neutral" | "positive" | "negative" | "emphasis";

/** Palavra individual com timestamp (word-level do Whisper). */
export interface Word {
  text: string;
  start: number; // segundos
  end: number; // segundos
  sentiment?: Sentiment;
}

/**
 * "Legenda" = uma linha de legenda (segmento do Whisper).
 * O índice desta legenda no array é o que a IA usa em `startLeg`.
 */
export interface Legenda {
  index: number;
  text: string;
  start: number; // segundos
  end: number; // segundos
  words: Word[];
}

export type SceneType =
  | "intro"
  | "statement"
  | "illustration"
  | "quote"
  | "list"
  | "bignumber"
  | "outro";

/**
 * Cena definida pela IA. O timing NÃO usa frames — usa `startLeg`,
 * o índice da legenda onde a cena começa. convertScenesFromLegendaIndex()
 * transforma isso em frames exatos.
 */
export interface Scene {
  id: string;
  type: SceneType;
  /** Índice da legenda (em `legendas`) onde esta cena começa. */
  startLeg: number;
  title?: string;
  subtitle?: string;
  text?: string;
  items?: string[];
  /** Ex.: "87%", "10x", "R$ 1.2M" */
  number?: string;
  numberLabel?: string;
  /** Prompt para gerar a ilustração IA (cenas type=illustration). */
  imagePrompt?: string;
  /** URL/caminho da ilustração gerada. */
  imageUrl?: string;
  /** Sobrescreve a cor de acento da paleta para esta cena. */
  accentColor?: string;
}

export interface Palette {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
}

export interface Analysis {
  /** Formato narrativo identificado (ex.: "listicle", "história", "tutorial"). */
  narrativeFormat: string;
  summary: string;
  /** Título curto sugerido para o vídeo. */
  title: string;
  palette: Palette;
  scenes: Scene[];
}

export interface ProjectFiles {
  raw?: string; // caminho do MP4 bruto
  normalized?: string; // caminho do MP4 normalizado (H.264 CFR 30fps)
  audio?: string; // caminho do áudio extraído (para o Whisper)
  srt?: string; // caminho do .srt gerado
  output?: string; // caminho do MP4 renderizado final
}

export interface Project {
  id: string;
  name: string;
  stage: PipelineStage;
  /** Prompt/observação opcional do usuário no upload. */
  prompt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;

  // Formato fixo do vídeo
  width: number; // 1080
  height: number; // 1920
  fps: number; // 30

  durationInSeconds?: number;
  files: ProjectFiles;

  legendas: Legenda[];
  analysis?: Analysis;
}

// --------------------------------------------------------------------------
// Props que a app envia ao Remotion (composição MainVideo).
// --------------------------------------------------------------------------

/** Cena já com timing resolvido em frames (saída de convertScenesFromLegendaIndex). */
export interface TimedScene extends Scene {
  from: number; // frame inicial
  durationInFrames: number;
}

export interface MainVideoProps {
  width: number;
  height: number;
  fps: number;
  /** Áudio da narração (URL pública p/ preview, caminho absoluto p/ render). */
  audioSrc?: string;
  legendas: Legenda[];
  scenes: TimedScene[];
  palette: Palette;
}

export const VIDEO_DEFAULTS = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const DEFAULT_PALETTE: Palette = {
  background: "#050508",
  surface: "#101018",
  primary: "#FFB800",
  secondary: "#ffcb45",
  accent: "#ff9d00",
  text: "#f5f5f7",
  muted: "#9a9aa5",
};
