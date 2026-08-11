"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import {
  buildMarker,
  buildParticles,
  buildTerrain,
  heightAt,
  smoothstep,
  type TerrainPalette,
} from "@/components/flagship-terrain/terrain-core";

interface MarkerSpec {
  id: string;
  x: number;
  z: number;
}

const MARKERS: MarkerSpec[] = [
  { id: "knowledge", x: -6.5, z: -3.5 },
  { id: "aurasql", x: 7, z: -6 },
  { id: "analysis", x: 5, z: 4.5 },
  { id: "career", x: -5.5, z: 6 },
];

const BENCHMARK = { x: 0, z: 0.5 };

// Narrative marks: reached after the 4 studio markers, on the way to the
// finale. Rendered with the same instrument primitive as the studio markers
// (buildMarker) but tracked separately so they don't feed the benchmark
// post's "studios resolved" glow, which is scoped to MARKERS.length.
const PROOF_MARK: MarkerSpec = { id: "proof", x: -3, z: -9.5 };
const CREATOR_MARK: MarkerSpec = { id: "creator", x: 3, z: 10 };

function markerWorldPos(marker: MarkerSpec, yOffset = 0) {
  return new THREE.Vector3(marker.x, heightAt(marker.x, marker.z) + yOffset, marker.z);
}

function dollyStop(marker: MarkerSpec, angle: number, radius = 4.2, lift = 2.6) {
  const target = markerWorldPos(marker, 0.6);
  const pos = new THREE.Vector3(
    marker.x + Math.cos(angle) * radius,
    target.y + lift,
    marker.z + Math.sin(angle) * radius,
  );
  return { pos, look: target };
}

function buildCameraWaypoints() {
  const benchmarkY = heightAt(BENCHMARK.x, BENCHMARK.z);
  const wide = { pos: new THREE.Vector3(0, 10, 17), look: new THREE.Vector3(0, benchmarkY, 0) };
  const stops = MARKERS.map((marker, i) => dollyStop(marker, (i / MARKERS.length) * Math.PI * 2 + 0.4));
  const proofStop = dollyStop(PROOF_MARK, Math.PI * 0.15, 5, 3.2);
  const creatorStop = dollyStop(CREATOR_MARK, Math.PI * 1.1, 5, 3.2);
  const finale = { pos: new THREE.Vector3(0, 12.5, 19), look: new THREE.Vector3(0, benchmarkY + 0.5, 0) };
  return [wide, ...stops, proofStop, creatorStop, finale];
}

const CAMERA_WAYPOINTS = buildCameraWaypoints();
const SEGMENT_COUNT = CAMERA_WAYPOINTS.length - 1;

export function TerrainScene({
  progressRef,
  active,
  palette,
}: {
  progressRef: React.MutableRefObject<number>;
  active: boolean;
  palette: TerrainPalette;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!active || !host) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(palette.fogColor, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.fogColor.getHex(), 12, 34);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);

    const terrain = buildTerrain(palette);
    scene.add(terrain);

    const particles = buildParticles(palette);
    scene.add(particles);

    const benchmarkY = heightAt(BENCHMARK.x, BENCHMARK.z);
    const benchmarkPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 1.0, 10),
      new THREE.MeshBasicMaterial({ color: palette.signal, transparent: true, opacity: 0 }),
    );
    benchmarkPost.position.set(BENCHMARK.x, benchmarkY + 0.5, BENCHMARK.z);
    const benchmarkGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 20),
      new THREE.MeshBasicMaterial({ color: palette.signal, transparent: true, opacity: 0 }),
    );
    benchmarkGlow.position.set(BENCHMARK.x, benchmarkY + 1.0, BENCHMARK.z);
    scene.add(benchmarkPost, benchmarkGlow);

    const markers = MARKERS.map((spec) => {
      const { group, materials } = buildMarker(palette);
      group.position.set(spec.x, heightAt(spec.x, spec.z), spec.z);
      scene.add(group);

      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(spec.x, heightAt(spec.x, spec.z) + 0.72, spec.z),
        benchmarkGlow.position.clone(),
      ]);
      const line = new THREE.Line(
        lineGeom,
        new THREE.LineBasicMaterial({ color: palette.hazy, transparent: true, opacity: 0 }),
      );
      scene.add(line);

      return { spec, materials, line };
    });

    // Reached after the 4 studio markers (waypoint indices 5 and 6, see
    // buildCameraWaypoints) — same instrument primitive, no sightline back
    // to the benchmark since they aren't "studios resolved" data points.
    const narrativeMarks = [
      { spec: PROOF_MARK, waypointIndex: 5 },
      { spec: CREATOR_MARK, waypointIndex: 6 },
    ].map(({ spec, waypointIndex }) => {
      const { group, materials } = buildMarker(palette);
      group.position.set(spec.x, heightAt(spec.x, spec.z), spec.z);
      scene.add(group);
      return { spec, materials, waypointIndex };
    });

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.4, 0.86);
    composer.addPass(bloom);

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
      pos.x += Math.sin(elapsed * 0.1) * 0.08;
      pos.y += Math.cos(elapsed * 0.09) * 0.05;
      camera.position.copy(pos);
      camera.lookAt(look);

      (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

      let resolvedCount = 0;
      markers.forEach(({ materials, line }, i) => {
        const resolveT = resolveTFor(i + 1, progress);
        if (resolveT > 0.95) resolvedCount++;
        const isActive = segment === i + 1;
        const boost = isActive ? 0.12 * Math.sin(elapsed * 2.4) : 0;

        materials.forEach((m) => {
          m.color.lerpColors(palette.hazy, palette.signal, resolveT);
          m.opacity = 0.4 + resolveT * (0.5 + boost);
        });

        const lineMat = line.material as THREE.LineBasicMaterial;
        lineMat.color.lerpColors(palette.hazy, palette.signal, resolveT);
        lineMat.opacity = resolveT * 0.7;
      });

      narrativeMarks.forEach(({ materials, waypointIndex }) => {
        const resolveT = resolveTFor(waypointIndex, progress);
        const isActive = segment === waypointIndex;
        const boost = isActive ? 0.12 * Math.sin(elapsed * 2.4) : 0;

        materials.forEach((m) => {
          m.color.lerpColors(palette.hazy, palette.signal, resolveT);
          m.opacity = 0.4 + resolveT * (0.5 + boost);
        });
      });

      const benchmarkT = resolvedCount / MARKERS.length;
      const postMat = benchmarkPost.material as THREE.MeshBasicMaterial;
      const glowMat = benchmarkGlow.material as THREE.MeshBasicMaterial;
      postMat.opacity = resolvedCount > 0 ? 0.5 + benchmarkT * 0.5 : 0;
      glowMat.opacity = benchmarkT * 0.5;
      benchmarkGlow.scale.setScalar(1 + benchmarkT * 2.4 + Math.sin(elapsed * 1.6) * 0.08 * benchmarkT);
      bloom.strength = 0.35 + benchmarkT * 0.35;

      composer.render();
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
      composer.setSize(width, height);
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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [active, progressRef, palette]);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />;
}
