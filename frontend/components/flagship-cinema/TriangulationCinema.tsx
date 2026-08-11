"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Colors echo TriangulationMark.tsx / app/globals.css: copper = reticle,
// data blue = source shapes + lines, signal orange = the resolved benchmark
// point only. Dark-theme-leaning HSL values (readable on both ivory and navy).
const COPPER = new THREE.Color().setHSL(36 / 360, 0.42, 0.56);
const DATA_BLUE = new THREE.Color().setHSL(200 / 360, 0.68, 0.58);
const SIGNAL = new THREE.Color().setHSL(18 / 360, 0.88, 0.56);
const HAZY = new THREE.Color().setHSL(40 / 360, 0.12, 0.55);

export interface StudioNode {
  id: string;
  position: [number, number, number];
}

const STUDIOS: StudioNode[] = [
  { id: "knowledge", position: [-2.5, 0.65, -1.0] },
  { id: "aurasql", position: [2.4, 0.85, -2.1] },
  { id: "analysis", position: [2.0, -0.75, -0.4] },
  { id: "career", position: [-2.1, -0.7, -1.7] },
];

// Camera waypoints for 6 narrative beats: hero (wide), one per studio
// (dolly toward it), finale (pull back with everything resolved).
const CAMERA_WAYPOINTS: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [
  { pos: new THREE.Vector3(0, 0.9, 11), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(-1.3, 0.5, 3.1), look: new THREE.Vector3(...STUDIOS[0].position) },
  { pos: new THREE.Vector3(1.1, 0.6, 2.6), look: new THREE.Vector3(...STUDIOS[1].position) },
  { pos: new THREE.Vector3(0.9, -0.2, 3.3), look: new THREE.Vector3(...STUDIOS[2].position) },
  { pos: new THREE.Vector3(-1.0, -0.1, 3.0), look: new THREE.Vector3(...STUDIOS[3].position) },
  { pos: new THREE.Vector3(0, 1.3, 6.6), look: new THREE.Vector3(0, 0, 0) },
];

const SEGMENT_COUNT = CAMERA_WAYPOINTS.length - 1;

function smoothstep(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

function buildStudioShape(id: string): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: HAZY,
    transparent: true,
    opacity: 0.32,
  });

  if (id === "knowledge") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.05), mat));
    [0.32, 0.06, -0.2, -0.46].forEach((y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.06), mat);
      bar.position.set(0, y, 0.05);
      group.add(bar);
    });
  } else if (id === "aurasql") {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.05), mat);
        cell.position.set(col * 0.4, row * 0.4, 0);
        group.add(cell);
      }
    }
  } else if (id === "analysis") {
    [0.4, 0.75, 0.55, 0.95].forEach((h, i) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.32, h, 0.06), mat);
      bar.position.set((i - 1.5) * 0.42, h / 2 - 0.5, 0);
      group.add(bar);
    });
  } else {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.05), mat));
    const avatar = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), mat);
    avatar.position.set(0, 0.38, 0.05);
    group.add(avatar);
    [0.02, -0.22, -0.44].forEach((y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), mat);
      bar.position.set(0, y, 0.05);
      group.add(bar);
    });
  }

  return group;
}

export function TriangulationCinema({
  progressRef,
  active,
}: {
  progressRef: React.MutableRefObject<number>;
  active: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!active || !host) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);

    // Reticle rings + ticks (copper), centered at origin.
    const reticle = new THREE.Group();
    [1.6, 1.15].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.012, r, 96),
        new THREE.MeshBasicMaterial({
          color: COPPER,
          transparent: true,
          opacity: i === 0 ? 0.22 : 0.4,
          side: THREE.DoubleSide,
        }),
      );
      reticle.add(ring);
    });
    for (let i = 0; i < 4; i++) {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.16, 0.02),
        new THREE.MeshBasicMaterial({ color: COPPER, transparent: true, opacity: 0.55 }),
      );
      const angle = (i / 4) * Math.PI * 2;
      tick.position.set(Math.sin(angle) * 1.72, Math.cos(angle) * 1.72, 0);
      tick.rotation.z = -angle;
      reticle.add(tick);
    }
    scene.add(reticle);

    // Resolved benchmark point at center (signal orange, glows as studios resolve).
    const benchmarkCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 24, 24),
      new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 }),
    );
    const benchmarkGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 24, 24),
      new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 }),
    );
    scene.add(benchmarkCore, benchmarkGlow);

    // Studio shapes + triangulation lines.
    const shapes = STUDIOS.map((studio) => {
      const group = buildStudioShape(studio.id);
      group.position.set(...studio.position);
      scene.add(group);

      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...studio.position),
      ]);
      const line = new THREE.Line(
        lineGeom,
        new THREE.LineBasicMaterial({ color: DATA_BLUE, transparent: true, opacity: 0 }),
      );
      scene.add(line);

      return { studio, group, line };
    });

    const clock = new THREE.Clock();
    let frame = 0;
    let intersecting = false;

    const resolveTFor = (segmentIndex: number, progress: number) => {
      const segStart = segmentIndex / SEGMENT_COUNT;
      const segHalf = 0.5 / SEGMENT_COUNT;
      return smoothstep((progress - segStart) / segHalf);
    };

    const render = () => {
      const progress = progressRef.current;
      const t = progress * SEGMENT_COUNT;
      const segment = Math.min(Math.floor(t), SEGMENT_COUNT - 1);
      const localT = smoothstep(t - segment);

      const from = CAMERA_WAYPOINTS[segment];
      const to = CAMERA_WAYPOINTS[segment + 1];
      const pos = new THREE.Vector3().lerpVectors(from.pos, to.pos, localT);
      const look = new THREE.Vector3().lerpVectors(from.look, to.look, localT);

      const elapsed = clock.getElapsedTime();
      pos.x += Math.sin(elapsed * 0.15) * 0.06;
      pos.y += Math.cos(elapsed * 0.12) * 0.04;

      camera.position.copy(pos);
      camera.lookAt(look);

      let resolvedCount = 0;
      shapes.forEach(({ group, line }, i) => {
        const resolveT = resolveTFor(i + 1, progress);
        if (resolveT > 0.95) resolvedCount++;
        const isActive = segment === i + 1;
        const boost = isActive ? 0.15 * Math.sin(elapsed * 2.4) : 0;

        group.children.forEach((child) => {
          const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          m.color.lerpColors(HAZY, DATA_BLUE, resolveT);
          m.opacity = 0.32 + resolveT * (0.62 + boost);
        });

        const lineMat = line.material as THREE.LineBasicMaterial;
        lineMat.opacity = resolveT * 0.75;
        lineMat.color.lerpColors(DATA_BLUE, SIGNAL, isActive ? Math.abs(Math.sin(elapsed * 2.4)) * 0.3 : 0);

        const scale = 0.85 + resolveT * 0.15 + boost * 0.3;
        group.scale.setScalar(scale);
      });

      const benchmarkT = resolvedCount / STUDIOS.length;
      const coreMat = benchmarkCore.material as THREE.MeshBasicMaterial;
      const glowMat = benchmarkGlow.material as THREE.MeshBasicMaterial;
      coreMat.opacity = Math.min(1, resolvedCount > 0 ? 0.5 + benchmarkT * 0.5 : 0);
      glowMat.opacity = benchmarkT * 0.35;
      const glowScale = 1 + benchmarkT * 2.2 + Math.sin(elapsed * 1.6) * 0.08 * benchmarkT;
      benchmarkGlow.scale.setScalar(glowScale);

      renderer.render(scene, camera);
      frame = intersecting && document.visibilityState === "visible" ? requestAnimationFrame(render) : 0;
    };

    const syncAnimation = () => {
      if (intersecting && document.visibilityState === "visible" && frame === 0) {
        frame = requestAnimationFrame(render);
      } else if ((!intersecting || document.visibilityState !== "visible") && frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        syncAnimation();
      },
      { threshold: 0.02 },
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", syncAnimation);

    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resize.observe(host);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", syncAnimation);
      observer.disconnect();
      resize.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [active, progressRef]);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />;
}
