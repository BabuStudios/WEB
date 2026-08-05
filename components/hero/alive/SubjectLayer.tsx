"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface SubjectConfig {
  /** Plane size for photo mode, in world units. */
  width?: number;
  height?: number;
  /** Breath amplitude and rate. */
  breathAmount?: number;
  breathSpeed?: number;
}

const LEAN = { y: 0.2, x: 0.1 }; // never above 0.3Y / 0.15X

/** PNG with alpha, rendered on a plane in 3D space. */
function SubjectPhoto({ asset, config }: { asset: string; config: SubjectConfig }) {
  const texture = useTexture(asset);
  const mesh = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  const {
    width = 3.5,
    height = 4.5,
    breathAmount = 0.05,
    breathSpeed = 0.35,
  } = config;

  // Breath is active from frame one — no delay, no gate.
  useFrame((state, delta) => {
    if (!mesh.current) return;
    t.current += delta;
    mesh.current.position.y = Math.sin(t.current * breathSpeed) * breathAmount;
    mesh.current.rotation.z = Math.sin(t.current * 0.2) * 0.008;

    const { pointer } = state;
    mesh.current.rotation.y +=
      (pointer.x * LEAN.y - mesh.current.rotation.y) * 0.05;
    mesh.current.rotation.x +=
      (-pointer.y * LEAN.x - mesh.current.rotation.x) * 0.05;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** .glb model. */
function Subject3D({ asset, config }: { asset: string; config: SubjectConfig }) {
  const { scene } = useGLTF(asset);
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  const { breathAmount = 0.06, breathSpeed = 0.4 } = config;

  useFrame((state, delta) => {
    if (!group.current) return;
    t.current += delta;
    group.current.position.y = Math.sin(t.current * breathSpeed) * breathAmount;

    const { pointer } = state;
    group.current.rotation.y +=
      (pointer.x * 0.3 - group.current.rotation.y) * 0.05;
    group.current.rotation.x +=
      (-pointer.y * 0.15 - group.current.rotation.x) * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
      <group ref={group}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

export type HeroMode = "photo" | "3d" | "svg" | "video";

export function SubjectLayer({
  mode,
  asset,
  config = {},
}: {
  mode: HeroMode;
  asset?: string;
  config?: SubjectConfig;
}) {
  if (!asset) return null;
  if (mode === "3d") return <Subject3D asset={asset} config={config} />;
  if (mode === "photo") return <SubjectPhoto asset={asset} config={config} />;
  // svg and video subjects live in the HTML layer, not the canvas.
  return null;
}
