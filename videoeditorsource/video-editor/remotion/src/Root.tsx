import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { DEFAULT_PALETTE, type MainVideoProps } from "./types";
import { demoProps } from "./demoProps";

// Duração default (frames) usada só no Studio; o render sobrescreve via
// calculateMetadata / selectComposition com a duração real.
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={demoProps as unknown as Record<string, unknown>}
        calculateMetadata={({ props }) => {
          const p = props as unknown as MainVideoProps;
          const last = p.scenes?.[p.scenes.length - 1];
          const total = last ? last.from + last.durationInFrames : FPS * 20;
          return {
            durationInFrames: Math.max(total, FPS),
            fps: p.fps || FPS,
            width: p.width || 1080,
            height: p.height || 1920,
          };
        }}
      />
    </>
  );
};

export { DEFAULT_PALETTE };
