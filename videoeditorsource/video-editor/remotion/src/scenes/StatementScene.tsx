import React from "react";
import { interpolate } from "remotion";
import { SORA } from "../theme";
import { CenterFill, SceneComponentProps, accentOf, useEnter } from "./common";

export const StatementScene: React.FC<SceneComponentProps> = ({
  scene,
  palette,
}) => {
  const accent = accentOf(scene, palette);
  const e = useEnter(0, 26);
  const text = scene.text || scene.title || "";

  return (
    <CenterFill>
      <div
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.08,
          color: palette.text,
          opacity: e,
          transform: `translateY(${interpolate(e, [0, 1], [50, 0])}px) scale(${interpolate(
            e,
            [0, 1],
            [0.92, 1]
          )})`,
          letterSpacing: "-1.5px",
        }}
      >
        {scene.title && scene.text ? (
          <span style={{ color: accent }}>{scene.title} </span>
        ) : null}
        {text}
      </div>
    </CenterFill>
  );
};
