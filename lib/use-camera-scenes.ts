"use client";

import { createContext, useContext } from "react";

/** px between scenes on the Z-axis — shared by CameraRig and Scene. */
export const SCENE_DEPTH = 800;

/** px — 800 = dramatic, 1800 = subtle. */
export const PERSPECTIVE = 1200;

interface CameraContextValue {
  sceneCount: number;
  /**
   * The scroll track element. Scenes trigger against it, never the document.
   *
   * Passed as an element in state rather than a ref, because React attaches a
   * parent's ref only after its children's layout effects have run — a child
   * reading trackRef.current during its own useGSAP would always see null.
   */
  track: HTMLElement | null;
}

export const CameraContext = createContext<CameraContextValue>({
  sceneCount: 1,
  track: null,
});

export function useCameraScenes() {
  return useContext(CameraContext);
}
