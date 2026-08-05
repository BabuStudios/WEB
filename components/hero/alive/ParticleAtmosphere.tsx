"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface DustConfig {
  count: number;
  color: string;
  speed: number;
  opacity: number;
}

export interface FlareConfig {
  count: number;
  color: string;
  pulse: boolean;
}

export interface StarfieldConfig {
  count: number;
  color: string;
  opacity: number;
}

export interface ParticleConfig {
  dust?: DustConfig;
  flares?: FlareConfig;
  starfield?: StarfieldConfig;
}

/**
 * A soft radial sprite. Without a map, pointsMaterial draws hard squares —
 * which read as artefacts rather than as dust and light.
 * Built once, shared by every layer, and never disposed while the page lives.
 */
let sprite: THREE.Texture | null = null;

function useSpriteTexture() {
  return useMemo(() => {
    if (sprite) return sprite;
    const size = 64;
    const el = document.createElement("canvas");
    el.width = size;
    el.height = size;
    const ctx = el.getContext("2d")!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    sprite = new THREE.CanvasTexture(el);
    return sprite;
  }, []);
}

/** DUST — fine motes drifting upward. */
function DustLayer({ count, color, speed, opacity }: DustConfig) {
  const mesh = useRef<THREE.Points>(null);
  const map = useSpriteTexture();

  const velocities = useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      vel[i * 3] = (Math.random() - 0.5) * speed * 0.3;
      vel[i * 3 + 1] = Math.random() * speed;
      vel[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.1;
    }
    return vel;
  }, [count, speed]);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  // Buffer is mutated in place every frame — geometry is never recreated.
  useFrame((_, delta) => {
    if (!mesh.current) return;
    const attr = mesh.current.geometry.attributes.position;
    const pos = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] * delta;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
      if (pos[i * 3] > 6) pos[i * 3] = -6;
      if (pos[i * 3] < -6) pos[i * 3] = 6;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        map={map}
        color={color}
        size={0.03}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** FLARES — soft luminous accents. Light, not objects: additive always. */
function FlareLayer({ count, color, pulse }: FlareConfig) {
  const mesh = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const map = useSpriteTexture();
  const clock = useRef(0);

  const offsets = useMemo(() => {
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) off[i] = Math.random() * Math.PI * 2;
    return off;
  }, [count]);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    clock.current += delta;
    const attr = mesh.current.geometry.attributes.position;
    const pos = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(clock.current * 0.2 + offsets[i]) * 0.04 * delta;
      pos[i * 3 + 1] += Math.cos(clock.current * 0.15 + offsets[i]) * 0.02 * delta;
    }
    attr.needsUpdate = true;
    if (pulse) {
      material.current.opacity = 0.4 + Math.sin(clock.current * 0.5) * 0.25;
    }
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        ref={material}
        map={map}
        color={color}
        size={0.16}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * STARFIELD — the distant drift layer. Sits far behind everything and rotates
 * almost imperceptibly, so the void reads as deep rather than as a backdrop.
 */
function StarfieldLayer({ count, color, opacity }: StarfieldConfig) {
  const group = useRef<THREE.Points>(null);
  const map = useSpriteTexture();

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = -8 - Math.random() * 14;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.004;
  });

  return (
    <points ref={group} geometry={geometry}>
      <pointsMaterial
        map={map}
        color={color}
        size={0.12}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticleAtmosphere({ config }: { config: ParticleConfig }) {
  return (
    <>
      {config.starfield && <StarfieldLayer {...config.starfield} />}
      {config.dust && <DustLayer {...config.dust} />}
      {config.flares && <FlareLayer {...config.flares} />}
    </>
  );
}
