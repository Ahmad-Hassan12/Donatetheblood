"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import type { RefObject } from "react";

interface PointerRef {
  current: { x: number; y: number };
}

function Drop({
  scrollRef,
  pointerRef,
}: {
  scrollRef: RefObject<number>;
  pointerRef: PointerRef;
}) {
  const outer = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const N = 64;
    const K = 1.5; // uniform scale — shape stays identical, just bigger
    const cy = 0.525; // profile's vertical center, so scaling keeps it inside the circle

    for (let i = 0; i <= N; i++) {
      const t = i / N; // 0 (top) to 1 (bottom)
      let r: number;
      let y: number;

      if (t < 0.4) {
        //  Top pointed portion — smooth curve from tip to widest point
        const u = t / 0.4;
        r = 0.45 * Math.sin((u * Math.PI) / 2);
        y = 1.2 - u * 0.9; // y: 1.2 → 0.3
      } else {
        // 🔵 Bottom rounded portion — semicircle for smooth rounded bottom
        const u = (t - 0.4) / 0.6;
        const angle = (u * Math.PI) / 2; // 0 → π/2
        // Semicircle centered at (0, 0.3) with radius 0.45
        r = 0.45 * Math.cos(angle);
        y = 0.3 - 0.45 * Math.sin(angle); // y: 0.3 → -0.15
      }

      points.push(
        new THREE.Vector2(Math.max(r, 0.001) * K, (y - cy) * K + cy)
      );
    }

    return new THREE.LatheGeometry(points, 64);
  }, []);

  useFrame(() => {
    const o = outer.current;
    if (!o) return;

    const px = pointerRef.current.x;
    const py = pointerRef.current.y;

    o.rotation.x += (py * 0.14 - o.rotation.x) * 0.06;
    o.rotation.y += (px * 0.22 - o.rotation.y) * 0.06;

    const sp = scrollRef.current;
    o.position.y = -sp * 1.1;
    o.rotation.z = -sp * 0.5;
  });

  return (
    <group ref={outer}>
      <mesh geometry={geometry} position={[0, -0.25, 0]} castShadow>
        <meshPhysicalMaterial
          color="#d91c2b"
          roughness={0.15}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.06}
          emissive="#7d0f1b"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

export default function HeroScene({
  scrollRef,
  pointerRef,
}: {
  scrollRef: RefObject<number>;
  pointerRef: PointerRef;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.3, 4.2], fov: 40 }}
      className="pointer-events-none"
      aria-hidden="true"
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight intensity={0.45} color="#ffd9dc" groundColor="#ffffff" />
      <directionalLight position={[4, 6, 5]} intensity={2.0} />
      <directionalLight position={[3, 4, 4]} intensity={3.2} />
      <directionalLight position={[-5, 2, -4]} intensity={0.8} />
      <pointLight position={[0, 1.6, 3]} intensity={12} color="#ff5a68" />
      <Drop scrollRef={scrollRef} pointerRef={pointerRef} />
    </Canvas>
  );
}