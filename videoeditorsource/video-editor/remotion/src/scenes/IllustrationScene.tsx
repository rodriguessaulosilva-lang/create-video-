import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { SORA } from "../theme";
import { SceneComponentProps, accentOf, useEnter } from "./common";

export const IllustrationScene: React.FC<SceneComponentProps> = ({
  scene,
  palette,
}) => {
  const accent = accentOf(scene, palette);
  const frame = useCurrentFrame();
  const e = useEnter(0);
  // Ken Burns lento na imagem.
  const scale = interpolate(frame, [0, 120], [1.08, 1.18], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {scene.imageUrl ? (
        <AbsoluteFill style={{ opacity: e }}>
          <Img
            src={scene.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
            }}
          />
          {/* Gradiente inferior para dar leitura ao texto */}
          <AbsoluteFill
            style={{
              background: `linear-gradient(to top, ${palette.background} 4%, transparent 45%)`,
            }}
          />
        </AbsoluteFill>
      ) : (
        // Placeholder enquanto a ilustração não foi gerada.
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            border: `2px dashed ${accent}55`,
            margin: 60,
            borderRadius: 32,
            opacity: e,
          }}
        >
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 600,
              fontSize: 40,
              color: palette.muted,
              textAlign: "center",
              padding: 60,
            }}
          >
            🖼️ Ilustração IA
            <div style={{ fontSize: 28, marginTop: 16, color: accent }}>
              {scene.imagePrompt || "gere a imagem na revisão"}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {scene.title ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 520,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <div
            style={{
              fontFamily: SORA,
              fontWeight: 800,
              fontSize: 84,
              color: palette.text,
              textAlign: "center",
              textShadow: "0 6px 30px rgba(0,0,0,0.9)",
              opacity: e,
              transform: `translateY(${interpolate(e, [0, 1], [30, 0])}px)`,
            }}
          >
            {scene.title}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
