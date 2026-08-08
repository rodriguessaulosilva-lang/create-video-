import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SORA } from "../theme";
import { CenterFill, SceneComponentProps, accentOf, useEnter } from "./common";

// Extrai a parte numérica para animar a contagem (ex.: "87%" -> 87, sufixo "%").
function parseNumber(raw?: string): { value: number; suffix: string; prefix: string } {
  if (!raw) return { value: 0, suffix: "", prefix: "" };
  const m = /^([^\d-]*)(-?[\d.,]+)(.*)$/.exec(raw.trim());
  if (!m) return { value: 0, suffix: raw, prefix: "" };
  const value = parseFloat(m[2].replace(/\./g, "").replace(",", "."));
  return { prefix: m[1], value: isNaN(value) ? 0 : value, suffix: m[3] };
}

export const BigNumberScene: React.FC<SceneComponentProps> = ({
  scene,
  palette,
}) => {
  const accent = accentOf(scene, palette);
  const frame = useCurrentFrame();
  const e = useEnter(0);
  const { value, suffix, prefix } = parseNumber(scene.number);

  // Contagem nos primeiros 24 frames.
  const counted = Math.round(interpolate(frame, [0, 24], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const display = value % 1 === 0 ? String(counted) : counted.toFixed(1);

  return (
    <CenterFill>
      <div
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 260,
          lineHeight: 1,
          color: accent,
          opacity: e,
          transform: `scale(${interpolate(e, [0, 1], [0.6, 1])})`,
          textShadow: `0 0 80px ${accent}55`,
          letterSpacing: "-6px",
        }}
      >
        {prefix}
        {display}
        {suffix}
      </div>
      {scene.numberLabel ? (
        <div
          style={{
            fontFamily: SORA,
            fontWeight: 600,
            fontSize: 56,
            color: palette.text,
            opacity: interpolate(frame, [12, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {scene.numberLabel}
        </div>
      ) : null}
    </CenterFill>
  );
};
