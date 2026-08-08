import React from "react";
import { interpolate } from "remotion";
import { SORA } from "../theme";
import { CenterFill, Kicker, SceneComponentProps, accentOf, useEnter } from "./common";

export const IntroScene: React.FC<SceneComponentProps> = ({ scene, palette }) => {
  const accent = accentOf(scene, palette);
  const e1 = useEnter(0);
  const e2 = useEnter(8);
  const e3 = useEnter(16);

  return (
    <CenterFill>
      {scene.subtitle ? (
        <Kicker accent={accent} enter={e1}>
          {scene.subtitle}
        </Kicker>
      ) : null}
      <h1
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 128,
          lineHeight: 1.02,
          color: palette.text,
          margin: 0,
          opacity: e2,
          transform: `translateY(${interpolate(e2, [0, 1], [40, 0])}px)`,
          letterSpacing: "-2px",
        }}
      >
        {scene.title}
      </h1>
      <div
        style={{
          height: 8,
          width: interpolate(e3, [0, 1], [0, 320]),
          borderRadius: 8,
          background: `linear-gradient(90deg, ${accent}, ${palette.secondary})`,
          boxShadow: `0 0 40px ${accent}`,
        }}
      />
    </CenterFill>
  );
};
