import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import type { MainVideoProps } from "./types";
import { SceneRenderer } from "./scenes";
import { Captions } from "./Captions";
import { SORA } from "./theme";

// Composição principal: sequência de cenas animadas + trilha de narração
// (áudio do vídeo normalizado) + legendas TikTok por cima de tudo.
export const MainVideo: React.FC<MainVideoProps> = ({
  audioSrc,
  legendas,
  scenes,
  palette,
  fps,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        fontFamily: SORA,
      }}
    >
      {/* Áudio da narração original */}
      {audioSrc ? <Audio src={audioSrc} /> : null}

      {/* Cenas visuais */}
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
          name={`${scene.type} @${scene.startLeg}`}
        >
          <SceneRenderer scene={scene} palette={palette} fps={fps} />
        </Sequence>
      ))}

      {/* Legendas palavra-por-palavra por cima de tudo */}
      <Captions legendas={legendas} palette={palette} fps={fps} />
    </AbsoluteFill>
  );
};
