import React from "react";
import { interpolate } from "remotion";
import { SORA } from "../theme";
import { CenterFill, Kicker, SceneComponentProps, accentOf, useEnter } from "./common";

export const OutroScene: React.FC<SceneComponentProps> = ({ scene, palette }) => {
  const accent = accentOf(scene, palette);
  const e1 = useEnter(0);
  const e2 = useEnter(10);

  return (
    <CenterFill>
      <h1
        style={{
          fontFamily: SORA,
          fontWeight: 800,
          fontSize: 110,
          lineHeight: 1.05,
          color: palette.text,
          margin: 0,
          opacity: e1,
          transform: `scale(${interpolate(e1, [0, 1], [0.9, 1])})`,
          letterSpacing: "-1.5px",
        }}
      >
        {scene.title || "Segue pra mais"}
      </h1>
      {scene.subtitle ? (
        <div
          style={{
            fontFamily: SORA,
            fontWeight: 600,
            fontSize: 52,
            color: palette.muted,
            opacity: e2,
          }}
        >
          {scene.subtitle}
        </div>
      ) : null}
      <div style={{ opacity: e2, marginTop: 20 }}>
        <Kicker accent={accent} enter={e2}>
          {scene.text || "👆 Salva e compartilha"}
        </Kicker>
      </div>
    </CenterFill>
  );
};
