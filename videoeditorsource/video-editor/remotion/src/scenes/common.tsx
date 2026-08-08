import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Palette, Scene } from "../types";

export interface SceneComponentProps {
  scene: Scene;
  palette: Palette;
  fps: number;
}

/** Cor de acento efetiva da cena (override > paleta). */
export function accentOf(scene: Scene, palette: Palette): string {
  return scene.accentColor || palette.primary;
}

/** Spring de entrada padrão (0 -> 1). */
export function useEnter(delay = 0, durationInFrames = 22): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.7 },
    durationInFrames,
  });
}

/** Fundo premium: gradiente + halos suaves com leve deriva animada. */
export const SceneBackground: React.FC<{
  palette: Palette;
  accent: string;
}> = ({ palette, accent }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 40;
  const drift2 = Math.cos(frame / 55) * 50;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${palette.surface} 0%, ${palette.background} 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift / 10}% 22%, ${accent}22 0%, transparent 45%)`,
          transform: `translateY(${drift}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + drift2 / 10}% 82%, ${palette.secondary}18 0%, transparent 40%)`,
          transform: `translateY(${drift2}px)`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 300px 80px rgba(0,0,0,0.75)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Pílula com o "kicker"/label pequeno de acento. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  accent: string;
  enter: number;
}> = ({ children, accent, enter }) => (
  <div
    style={{
      opacity: enter,
      transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
      alignSelf: "center",
      padding: "12px 28px",
      borderRadius: 999,
      border: `2px solid ${accent}`,
      color: accent,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: 2,
      textTransform: "uppercase",
      background: "rgba(255,255,255,0.03)",
    }}
  >
    {children}
  </div>
);

export const CenterFill: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: "0 90px",
      textAlign: "center",
      gap: 36,
    }}
  >
    {children}
  </AbsoluteFill>
);
