"use client";

import { createContext, useContext } from "react";

interface SceneContextValue {
  /** The scroll track element scenes are positioned along. Null on mobile. */
  track: HTMLElement | null;
  /** Track progress (0–1) at which this scene's content should reveal. */
  enterAt: number;
  /** Track progress at which the camera arrives at this scene. */
  centre: number;
  /** Half the scene's visible window, in track progress. */
  halfWidth: number;
}

/**
 * Inside CameraRig every scene is permanently within the viewport — the sticky
 * window never leaves it — so viewport-relative triggers are meaningless there.
 * Scenes publish where they sit on the track and everything inside them
 * (content reveals, layer parallax, the hero canvas gate) works from that.
 *
 * Null track means no camera (the mobile stack), where ordinary viewport
 * triggers are correct.
 */
export const SceneContext = createContext<SceneContextValue>({
  track: null,
  enterAt: 0,
  centre: 0,
  halfWidth: 1,
});

export function useSceneContext() {
  return useContext(SceneContext);
}
