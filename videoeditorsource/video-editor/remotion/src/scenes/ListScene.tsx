import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SORA } from "../theme";
import { SceneComponentProps, accentOf, useEnter } from "./common";

export const ListScene: React.FC<SceneComponentProps> = ({ scene, palette }) => {
  const accent = accentOf(scene, palette);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eTitle = useEnter(0);
  const items = scene.items || [];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 90px",
        gap: 40,
      }}
    >
      {scene.title ? (
        <h2
          style={{
            fontFamily: SORA,
            fontWeight: 800,
            fontSize: 84,
            color: palette.text,
            margin: 0,
            opacity: eTitle,
            transform: `translateY(${interpolate(eTitle, [0, 1], [30, 0])}px)`,
            letterSpacing: "-1px",
          }}
        >
          {scene.title}
        </h2>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {items.map((item, i) => {
          const delay = 10 + i * 8;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 160, mass: 0.6 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${palette.surface}`,
                borderRadius: 24,
                padding: "28px 34px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  minWidth: 72,
                  height: 72,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, ${accent}, ${palette.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SORA,
                  fontWeight: 800,
                  fontSize: 40,
                  color: palette.background,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: SORA,
                  fontWeight: 600,
                  fontSize: 52,
                  color: palette.text,
                  lineHeight: 1.1,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
