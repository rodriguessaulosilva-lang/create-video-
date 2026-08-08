// Espelho dos tipos da app (lib/types.ts). Mantenha em sincronia.

export type Sentiment = "neutral" | "positive" | "negative" | "emphasis";

export interface Word {
  text: string;
  start: number;
  end: number;
  sentiment?: Sentiment;
}

export interface Legenda {
  index: number;
  text: string;
  start: number;
  end: number;
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

export interface Scene {
  id: string;
  type: SceneType;
  startLeg: number;
  title?: string;
  subtitle?: string;
  text?: string;
  items?: string[];
  number?: string;
  numberLabel?: string;
  imagePrompt?: string;
  imageUrl?: string;
  accentColor?: string;
}

export interface TimedScene extends Scene {
  from: number;
  durationInFrames: number;
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

export interface MainVideoProps {
  width: number;
  height: number;
  fps: number;
  audioSrc?: string;
  legendas: Legenda[];
  scenes: TimedScene[];
  palette: Palette;
}

export const DEFAULT_PALETTE: Palette = {
  background: "#050508",
  surface: "#101018",
  primary: "#FFB800",
  secondary: "#ffcb45",
  accent: "#ff9d00",
  text: "#f5f5f7",
  muted: "#9a9aa5",
};
