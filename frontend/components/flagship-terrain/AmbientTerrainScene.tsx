"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import {
  buildParticles,
  buildTerrain,
  heightAt,
  type TerrainPalette,
} from "@/components/flagship-terrain/terrain-core";

const LOOK_AT = new THREE.Vector3(0, heightAt(0, 0), 0);
const CAMERA_POS = new THREE.Vector3(0, 9.5, 16);

export function AmbientTerrainScene({ active, palette }: { active: boolean; palette: TerrainPalette }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!active || !host) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(palette.fogColor, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.fogColor.getHex(), 12, 32);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);

    const terrain = buildTerrain(palette);
    scene.add(terrain);

    const particles = buildParticles(palette, 220);
    scene.add(particles);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.4, 0.9);
    composer.addPass(bloom);

    const clock = new THREE.Clock();
    let frame = 0;
    let intersecting = false;

    const render = () => {
      const elapsed = clock.getElapsedTime();
      // Held wide shot with a slow, small drift — ambient, not a dolly.
      camera.position.set(
        CAMERA_POS.x + Math.sin(elapsed * 0.05) * 0.6,
        CAMERA_POS.y + Math.cos(elapsed * 0.04) * 0.25,
        CAMERA_POS.z,
      );
      camera.lookAt(LOOK_AT);

      (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
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
  }, [active, palette]);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />;
}
