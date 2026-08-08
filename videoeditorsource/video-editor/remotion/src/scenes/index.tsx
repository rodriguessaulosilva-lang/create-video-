import React from "react";
import type { Palette, Scene } from "../types";
import { SceneBackground, accentOf } from "./common";
import { IntroScene } from "./IntroScene";
import { StatementScene } from "./StatementScene";
import { IllustrationScene } from "./IllustrationScene";
import { QuoteScene } from "./QuoteScene";
import { ListScene } from "./ListScene";
import { BigNumberScene } from "./BigNumberScene";
import { OutroScene } from "./OutroScene";

const REGISTRY: Record<
  Scene["type"],
  React.FC<{ scene: Scene; palette: Palette; fps: number }>
> = {
  intro: IntroScene,
  statement: StatementScene,
  illustration: IllustrationScene,
  quote: QuoteScene,
  list: ListScene,
  bignumber: BigNumberScene,
  outro: OutroScene,
};

export const SceneRenderer: React.FC<{
  scene: Scene;
  palette: Palette;
  fps: number;
}> = ({ scene, palette, fps }) => {
  const Comp = REGISTRY[scene.type] || StatementScene;
  const accent = accentOf(scene, palette);
  return (
    <>
      <SceneBackground palette={palette} accent={accent} />
      <Comp scene={scene} palette={palette} fps={fps} />
    </>
  );
};

export { REGISTRY };
