"use client";

import { createContext, useContext } from "react";

interface SceneRevealValue {
  /** The scroll track element scenes are positioned along. */
  track: HTMLElement | null;
  /** Track progress (0–1) at which this scene's content should reveal. */
  enterAt: number;
}

/**
 * Inside CameraRig every scene is permanently within the viewport — the sticky
 * window never leaves it — so a viewport-based reveal trigger would fire for
 * all scenes at once on load. Scenes publish the track progress at which they
 * arrive, and RevealOnScroll reveals against that instead.
 *
 * Null track means no camera (the mobile stack), where the ordinary
 * "top 85%" viewport trigger is correct.
 */
export const SceneRevealContext = createContext<SceneRevealValue>({
  track: null,
  enterAt: 0,
});

export function useSceneReveal() {
  return useContext(SceneRevealContext);
}
