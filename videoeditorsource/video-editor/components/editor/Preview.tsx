"use client";

import { useMemo, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
// Reusa a composição do projeto Remotion isolado (fonte única de verdade).
import { MainVideo } from "../../remotion/src/MainVideo";
import type { MainVideoProps } from "../../remotion/src/types";
import type { Project } from "@/lib/types";
import {
  convertScenesFromLegendaIndex,
  totalFramesFromLegendas,
} from "@/lib/timing";
import { videoUrl } from "@/lib/api";
import { DEFAULT_PALETTE } from "@/lib/types";

export function Preview({
  project,
  playerRef,
}: {
  project: Project;
  playerRef?: React.RefObject<PlayerRef>;
}) {
  const fps = project.fps;

  const inputProps: MainVideoProps = useMemo(() => {
    const duration =
      project.durationInSeconds ?? project.legendas.at(-1)?.end ?? 0;
    const scenes = convertScenesFromLegendaIndex(
      project.analysis?.scenes ?? [],
      project.legendas,
      fps,
      duration
    );
    return {
      width: project.width,
      height: project.height,
      fps,
      // No preview, o áudio vem da rota de vídeo (Range Requests dão seek).
      audioSrc: project.files.normalized ? videoUrl(project.id, "normalized") : undefined,
      legendas: project.legendas,
      scenes,
      palette: project.analysis?.palette ?? DEFAULT_PALETTE,
    };
  }, [project, fps]);

  const durationInFrames = useMemo(
    () =>
      Math.max(
        totalFramesFromLegendas(
          project.legendas,
          fps,
          project.durationInSeconds
        ),
        fps
      ),
    [project.legendas, project.durationInSeconds, fps]
  );

  const localRef = useRef<PlayerRef>(null);
  const ref = playerRef ?? localRef;

  return (
    <div className="glass-card overflow-hidden">
      <div className="mx-auto aspect-[9/16] max-h-[70vh] w-full">
        <Player
          ref={ref}
          component={MainVideo as any}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionWidth={project.width}
          compositionHeight={project.height}
          style={{ width: "100%", height: "100%" }}
          controls
          loop
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  );
}
