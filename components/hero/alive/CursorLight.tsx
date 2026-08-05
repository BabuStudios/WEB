"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** A point light that follows the cursor through the world. Never casts shadow. */
export function CursorLight({ color = "#FFE8D0" }: { color?: string }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const target = useRef(new THREE.Vector3(0, 0, 3));
  const { size } = useThree();

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      target.current.set(
        (e.clientX / size.width - 0.5) * 8,
        (-(e.clientY / size.height) + 0.5) * 5,
        3,
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [size]);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    lightRef.current.position.lerp(target.current, delta * 2.5);
  });

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={2.5}
      distance={8}
      decay={2}
      castShadow={false}
    />
  );
}
