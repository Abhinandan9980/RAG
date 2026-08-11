import * as THREE from "three";

// Deterministic value-noise terrain height field, shared by the terrain mesh,
// the studio marker placement, and every scene that reuses this world (the
// landing sequence and the ambient /apps backdrop) so markers and cameras
// agree on where the ground actually is.
function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const HEIGHT_SCALE = 2.0;

export function heightAt(x: number, z: number) {
  let h = 0;
  let amp = 1;
  let freq = 0.07;
  let total = 0;
  for (let i = 0; i < 4; i++) {
    h += valueNoise(x * freq, z * freq) * amp;
    total += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return (h / total) * HEIGHT_SCALE - HEIGHT_SCALE * 0.45;
}

export function smoothstep(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

// A palette is every color/appearance input the shared terrain world needs —
// separate from the geometry/motion (heightAt, camera waypoints, marker
// placement), which stays identical across themes. Two scenes (the landing
// sequence and the /apps ambient backdrop) each resolve one of the presets
// below from the site's light/dark toggle and pass it through; the shader
// and builder functions never read a fixed color themselves.
export interface TerrainPalette {
  colorLow: THREE.Color;
  colorMid: THREE.Color;
  colorHigh: THREE.Color;
  fogColor: THREE.Color;
  hazy: THREE.Color;
  signal: THREE.Color;
  particleColor: THREE.Color;
  particleBlending: THREE.Blending;
  particleOpacityScale: number;
}

// Dark: cool-shadow-to-warm-brass terrain ramp over a deep surveyor's-ink fog
// (matches --background dark: 222 46% 7%), signal/hazy tuned for a dark
// ground per the existing design system.
export const DARK_PALETTE: TerrainPalette = {
  colorLow: new THREE.Color().setHSL(200 / 360, 0.3, 0.12),
  colorMid: new THREE.Color().setHSL(36 / 360, 0.4, 0.32),
  colorHigh: new THREE.Color().setHSL(40 / 360, 0.28, 0.5),
  fogColor: new THREE.Color().setHSL(222 / 360, 0.46, 0.06),
  hazy: new THREE.Color().setHSL(40 / 360, 0.12, 0.55),
  signal: new THREE.Color().setHSL(18 / 360, 0.88, 0.56),
  particleColor: new THREE.Color().setHSL(36 / 360, 0.5, 0.72),
  particleBlending: THREE.AdditiveBlending,
  particleOpacityScale: 1,
};

// Light: "sunlit paper" — warm cream/parchment fog matching the site's
// existing light background (hsl(40 32% 96%), deepened slightly so terrain
// contours stay legible against it), a sand-to-terracotta-to-sun-bleached-
// stone terrain ramp, and hazy/signal pulled directly from the light theme's
// --copper/--signal tokens (globals.css) so markers match the rest of the
// light theme's accent exactly. Particles switch off additive blending —
// additive glow that reads against dark fog would wash out to white against
// a light background — to normal blending at reduced opacity instead.
export const LIGHT_PALETTE: TerrainPalette = {
  colorLow: new THREE.Color().setHSL(16 / 360, 0.48, 0.19),
  colorMid: new THREE.Color().setHSL(27 / 360, 0.52, 0.36),
  colorHigh: new THREE.Color().setHSL(40 / 360, 0.5, 0.6),
  fogColor: new THREE.Color().setHSL(38 / 360, 0.28, 0.88),
  hazy: new THREE.Color().setHSL(28 / 360, 0.22, 0.36),
  signal: new THREE.Color().setHSL(18 / 360, 0.82, 0.46),
  particleColor: new THREE.Color().setHSL(22 / 360, 0.48, 0.32),
  particleBlending: THREE.NormalBlending,
  particleOpacityScale: 0.65,
};

export function buildTerrain(palette: TerrainPalette) {
  const size = 44;
  const segments = 90;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
  }
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColorLow: { value: palette.colorLow },
      uColorMid: { value: palette.colorMid },
      uColorHigh: { value: palette.colorHigh },
      uFogColor: { value: palette.fogColor },
      uFogDensity: { value: 0.045 },
      uLightDir: { value: new THREE.Vector3(0.4, 0.85, 0.35).normalize() },
    },
    vertexShader: `
      varying float vHeight;
      varying vec3 vNormalW;
      varying vec3 vViewPos;
      void main() {
        vHeight = position.y;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPos = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorLow;
      uniform vec3 uColorMid;
      uniform vec3 uColorHigh;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform vec3 uLightDir;
      varying float vHeight;
      varying vec3 vNormalW;
      varying vec3 vViewPos;

      void main() {
        float t = clamp((vHeight + 0.9) / 1.8, 0.0, 1.0);
        vec3 base = mix(uColorLow, uColorMid, smoothstep(0.0, 0.55, t));
        base = mix(base, uColorHigh, smoothstep(0.6, 1.0, t));

        float diff = max(dot(normalize(vNormalW), normalize(uLightDir)), 0.0);
        vec3 lit = base * (0.5 + 0.6 * diff);

        float bands = fract(vHeight * 8.0);
        float line = smoothstep(0.0, 0.035, bands) * smoothstep(0.09, 0.035, bands);
        lit = mix(lit, uColorHigh, line * 0.3);

        float fogDist = length(vViewPos);
        float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * fogDist * fogDist);
        vec3 color = mix(lit, uFogColor, clamp(fogFactor, 0.0, 1.0));

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  return new THREE.Mesh(geometry, material);
}

export function buildParticles(palette: TerrainPalette, count = 420) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const y = heightAt(x, z) + 0.6 + Math.random() * 4.5;
    positions.set([x, y, z], i * 3);
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: palette.particleBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: palette.particleColor },
      uOpacityScale: { value: palette.particleOpacityScale },
    },
    vertexShader: `
      uniform float uTime;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.15 + aSeed * 6.283) * 0.4;
        p.x += cos(uTime * 0.1 + aSeed * 10.0) * 0.15;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (16.0 / -mvPosition.z) * (0.6 + aSeed * 0.8);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.3 + 0.3 * sin(uTime * 0.5 + aSeed * 20.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacityScale;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float a = smoothstep(0.5, 0.0, d) * vAlpha * uOpacityScale;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });

  return new THREE.Points(geometry, material);
}

export function buildMarker(palette: TerrainPalette) {
  const group = new THREE.Group();
  const postMat = new THREE.MeshBasicMaterial({ color: palette.hazy, transparent: true, opacity: 0.4 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.7, 10), postMat);
  post.position.y = 0.35;
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.hazy, transparent: true, opacity: 0.55 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.028, 10, 28), ringMat);
  ring.position.y = 0.72;
  ring.rotation.x = Math.PI / 2;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), postMat.clone());
  glow.position.y = 0.72;
  group.add(post, ring, glow);
  return { group, materials: [postMat, ringMat, glow.material as THREE.MeshBasicMaterial] };
}
