import * as THREE from "three";
import { skillGroups } from "@/data/portfolio";
import { LAYERS, LAYER_GAP } from "./shapes";

/** The solid things in the world: what the particles gather around in each chapter. */

const FRESNEL_VERTEX = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/** The heart of the spark: a ball of light, brightest at its rim, breathing slowly. */
export function createCore() {
  const uniforms = { uColor: { value: new THREE.Color() }, uOpacity: { value: 0 }, uTime: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.02, 64, 48),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uOpacity, uTime;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
          float rim = pow(1.0 - facing, 2.2);
          float heart = pow(facing, 5.0) * (0.55 + 0.2 * sin(uTime * 1.3));
          vec3 color = mix(uColor, vec3(1.0), rim * 0.35 + heart * 0.6) * (rim * 1.4 + heart);
          gl_FragColor = vec4(color, (rim + heart) * uOpacity);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  return { mesh, uniforms };
}

/** Six panes of glass, one per part of the stack, each with its name printed on it. */
export function createPlates() {
  const group = new THREE.Group();
  const SIZE = 6.3;
  const panes: { fill: THREE.MeshBasicMaterial; edge: THREE.LineBasicMaterial; label: THREE.MeshBasicMaterial; draw: () => void; texture: THREE.CanvasTexture }[] = [];
  const pane = new THREE.PlaneGeometry(SIZE, SIZE);
  const outline = new THREE.EdgesGeometry(pane);
  const sign = new THREE.PlaneGeometry(3.4, 0.64);

  skillGroups.slice(0, LAYERS).forEach((skill, i) => {
    const y = (LAYERS / 2 - 0.5 - i) * LAYER_GAP;
    const fill = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const surface = new THREE.Mesh(pane, fill);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = y;

    const edge = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const border = new THREE.LineSegments(outline, edge);
    border.rotation.x = -Math.PI / 2;
    border.position.y = y;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      ctx.clearRect(0, 0, 1024, 192);
      ctx.fillStyle = "#fff";
      ctx.font = `300 112px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.fillText(skill.label, 6, 100);
    };
    draw();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const name = new THREE.Mesh(sign, label);
    name.rotation.x = -Math.PI / 2;
    name.position.set(-SIZE / 2 + 1.85, y + 0.012, SIZE / 2 - 0.5);

    group.add(surface, border, name);
    panes.push({ fill, edge, label, draw, texture });
  });

  const update = (active: number, weight: number, color: THREE.Color) => {
    group.visible = weight > 0.01;
    panes.forEach((p, i) => {
      const on = i === active ? 1 : 0;
      p.fill.color.copy(color);
      p.edge.color.copy(color);
      p.fill.opacity += ((0.018 + on * 0.075) * weight - p.fill.opacity) * 0.14;
      p.edge.opacity += ((0.26 + on * 0.74) * weight - p.edge.opacity) * 0.14;
      p.label.opacity += ((0.3 + on * 0.7) * weight - p.label.opacity) * 0.14;
    });
  };

  const redraw = () =>
    panes.forEach((p) => {
      p.draw();
      p.texture.needsUpdate = true;
    });

  return { group, update, redraw };
}

/** A real planet under the horizon particles: a dark body and a lit atmosphere around its limb. */
export function createPlanet(radius: number, top: number) {
  const group = new THREE.Group();
  group.position.y = top - radius;
  const uniforms = { uRim: { value: new THREE.Color() }, uSky: { value: new THREE.Color() }, uOpacity: { value: 0 } };

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 128, 96),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: /* glsl */ `
        uniform vec3 uRim, uSky; uniform float uOpacity;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
          float limb = pow(1.0 - facing, 3.4);
          float dawn = pow(clamp(dot(normalize(vN), normalize(vec3(0.0, 0.9, 0.42))), 0.0, 1.0), 6.0);
          vec3 color = uSky * 0.035 + uRim * (limb * 0.5 + dawn * 0.09);
          gl_FragColor = vec4(color, uOpacity);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
    }),
  );

  const air = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.05, 128, 96),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: /* glsl */ `
        uniform vec3 uRim, uSky; uniform float uOpacity;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float glow = pow(clamp(dot(-normalize(vN), normalize(vV)), 0.0, 1.0), 3.5);
          gl_FragColor = vec4(mix(uSky, uRim, glow) * glow * 0.5, glow * uOpacity);
          #include <colorspace_fragment>
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );

  group.add(air, body);
  return { group, uniforms };
}

/** Light streaks that run past the camera in the tunnel; scroll speed pulls them long. */
export function createWarp(count: number) {
  const DEPTH = 42;
  const position = new Float32Array(count * 6);
  const end = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2.8 + Math.random() * 3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.72;
    const z = Math.random() * DEPTH;
    position.set([x, y, z, x, y, z], i * 6);
    end.set([0, 1], i * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
  const uniforms = { uTravel: { value: 0 }, uStretch: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color() } };
  const lines = new THREE.LineSegments(
    geometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        attribute float aEnd;
        uniform float uTravel, uStretch;
        varying float vFade;
        void main() {
          vec3 p = position;
          p.z = mod(p.z + uTravel, ${DEPTH.toFixed(1)}) - ${DEPTH.toFixed(1)} + aEnd * (0.15 + uStretch);
          vFade = smoothstep(-${DEPTH.toFixed(1)}, -24.0, p.z) * (1.0 - aEnd * 0.8);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uOpacity;
        varying float vFade;
        void main() {
          gl_FragColor = vec4(uColor, vFade * uOpacity);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  lines.frustumCulled = false;
  return { lines, uniforms };
}
