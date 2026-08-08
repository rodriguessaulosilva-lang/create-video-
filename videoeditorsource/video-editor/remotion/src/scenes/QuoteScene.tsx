import React from "react";
import { interpolate } from "remotion";
import { SORA } from "../theme";
import { CenterFill, SceneComponentProps, accentOf, useEnter } from "./common";

export const QuoteScene: React.FC<SceneComponentProps> = ({ scene, palette }) => {
  const accent = accentOf(scene, palette);
  const e = useEnter(0, 28);
  const eMark = useEnter(0, 18);

  return (
    <CenterFill>
      <div
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 220,
          lineHeight: 0.6,
          color: accent,
          opacity: interpolate(eMark, [0, 1], [0, 0.5]),
          transform: `scale(${interpolate(eMark, [0, 1], [0.5, 1])})`,
        }}
      >
        &ldquo;
      </div>
      <div
        style={{
          fontFamily: SORA,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: 88,
          lineHeight: 1.15,
          color: palette.text,
          opacity: e,
          transform: `translateY(${interpolate(e, [0, 1], [40, 0])}px)`,
        }}
      >
        {scene.text || scene.title}
      </div>
      {scene.subtitle ? (
        <div
          style={{
            fontFamily: SORA,
            fontWeight: 600,
            fontSize: 46,
            color: accent,
            opacity: e,
          }}
        >
          — {scene.subtitle}
        </div>
      ) : null}
    </CenterFill>
  );
};
