"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { worldState } from "@/lib/scroll";
import { createCore, createPlanet, createPlates, createWarp } from "./objects";
import { TUNNEL_LENGTH, horizon, infinity, loopPoint, spark, stack, tunnel } from "./shapes";

const SHAPES = 5;
const [LOOP, SPARK, STACK, TUNNEL, HORIZON] = [0, 1, 2, 3, 4];

type V3 = [number, number, number];
type Shot = { shape: number; from: { pos: V3; look: V3 }; to: { pos: V3; look: V3 }; spin: number; opaque?: boolean };

/** One camera move per chapter: where it starts, where it ends, which form the cloud holds. */
const SHOTS: Record<string, Shot> = {
  top: { shape: LOOP, from: { pos: [0, 0, 8.4], look: [0, 0, 0] }, to: { pos: [0, 0.2, 4.4], look: [0, 0, 0] }, spin: 0.05 },
  about: { shape: SPARK, from: { pos: [-3.5, 0.3, 8.6], look: [-3.5, 0, 0] }, to: { pos: [-3.2, -0.2, 7.6], look: [-3.2, 0, 0] }, spin: 0.14 },
  skills: { shape: STACK, from: { pos: [-5.2, 5.8, 10], look: [-2.1, 2.6, 0] }, to: { pos: [-5.2, -1.8, 10], look: [-2.1, -2.8, 0] }, spin: 0 },
  work: { shape: TUNNEL, from: { pos: [0, 0, 7.5], look: [0, 0, -6] }, to: { pos: [0, 0, -TUNNEL_LENGTH + 18], look: [0, 0, -TUNNEL_LENGTH] }, spin: 0 },
  services: { shape: TUNNEL, from: { pos: [0, 0, -TUNNEL_LENGTH + 18], look: [0, 0, -TUNNEL_LENGTH] }, to: { pos: [0, 0, -TUNNEL_LENGTH + 18], look: [0, 0, -TUNNEL_LENGTH] }, spin: 0, opaque: true },
  process: { shape: LOOP, from: { pos: [0, -1.4, 7.4], look: [0, 0, 0] }, to: { pos: [0, 0.3, 6.2], look: [0, 0, 0] }, spin: 0 },
  arcade: { shape: LOOP, from: { pos: [0, 0, 7], look: [0, 0, 0] }, to: { pos: [0, 0, 7], look: [0, 0, 0] }, spin: 0, opaque: true },
  contact: { shape: HORIZON, from: { pos: [0, 0.4, 11], look: [0, 0.2, 0] }, to: { pos: [0, 0.2, 9.6], look: [0, -0.1, 0] }, spin: 0.018 },
};

const VERTEX = /* glsl */ `
  attribute vec3 aS0; attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3; attribute vec3 aS4;
  attribute float aSeed; attribute float aLayer;
  uniform float uFrom[${SHAPES}]; uniform float uTo[${SHAPES}];
  uniform float uMorph, uTime, uPixel, uReveal, uLayer, uStack, uBoost, uPush;
  uniform vec2 uMouse;
  uniform vec3 uA, uB;
  varying vec3 vColor; varying float vAlpha;

  void main() {
    vec3 a = aS0 * uFrom[0] + aS1 * uFrom[1] + aS2 * uFrom[2] + aS3 * uFrom[3] + aS4 * uFrom[4];
    vec3 b = aS0 * uTo[0] + aS1 * uTo[1] + aS2 * uTo[2] + aS3 * uTo[3] + aS4 * uTo[4];

    // each particle leaves at its own moment, so forms pour into each other
    float t = smoothstep(0.0, 1.0, clamp((uMorph * 1.5 - aSeed * 0.5), 0.0, 1.0));
    vec3 p = mix(a, b, t);

    // in flight they swirl; at rest they only breathe
    float flight = sin(t * 3.14159);
    float ph = aSeed * 6.2831;
    p += vec3(sin(ph * 3.0 + uTime * 0.7), cos(ph * 2.0 + uTime * 0.6), sin(ph * 5.0 - uTime * 0.5)) * (0.02 + flight * 0.9);

    // the cursor parts them like a hand through smoke
    vec2 away = p.xy - uMouse;
    float near = exp(-dot(away, away) * 1.5) * uPush;
    p.xy += normalize(away + 0.0001) * near * (0.35 + aSeed * 0.85);
    p.z += near * (aSeed - 0.5) * 1.6;

    p *= uReveal;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float lit = 1.0;
    if (uLayer >= 0.0) lit = mix(1.0, abs(aLayer - uLayer) < 0.5 ? 2.0 : 0.42, uStack);

    float twinkle = 0.85 + 0.15 * sin(uTime * 1.4 + ph * 7.0);
    float size = (0.8 + aSeed * aSeed * 1.7) * twinkle * uBoost;
    gl_PointSize = clamp(size * uPixel * 24.0 / max(0.8, -mv.z), 1.0, 20.0 * uPixel);

    // colour flows across the form instead of being scattered through it
    float flow = smoothstep(-4.6, 4.6, p.x + p.y * 0.7 + p.z * 0.25);
    vColor = mix(uA, uB, clamp(flow + (aSeed - 0.5) * 0.14, 0.0, 1.0)) * (lit + near * 1.4);
    vAlpha = clamp(1.0 - (-mv.z) / 46.0, 0.05, 1.0) * clamp(-mv.z * 0.7, 0.0, 1.0) * uReveal * uBoost;
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 2.2);
    if (glow < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.5 + glow * 0.8), glow * vAlpha * 0.62);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixV = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.18, "rgba(255,255,255,.55)");
  r.addColorStop(0.45, "rgba(255,255,255,.1)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/**
 * The world behind the page: one cloud of particles that pours from form to form while a
 * camera flies through it, driven entirely by scroll position. Chapters are found from
 * [data-chapter] in the DOM, so the scene follows the layout rather than the other way round.
 *
 * Quality steps itself down if a device can't keep up: first the glow, then resolution,
 * then particle count. Add ?quality=high to the URL to hold it at full quality.
 */
export default function World() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the page still reads fine on the dark ground
    }

    const html = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const locked = new URLSearchParams(window.location.search).get("quality") === "high";
    const COUNT = small ? 22000 : 64000;
    let pixel = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    let quality = small ? 1 : 0; // 0 full, 1 no glow, 2 lower resolution, 3 fewer particles
    renderer.setPixelRatio(pixel);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
    const composer = new EffectComposer(renderer);
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.3, 0.5, 0.34);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ---------- the cloud ---------- */
    const layerOf = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) seed[i] = Math.random();
    const geometry = new THREE.BufferGeometry();
    const forms = [infinity(COUNT), spark(COUNT), stack(COUNT, layerOf), tunnel(COUNT), horizon(COUNT)];
    forms.forEach((f, i) => geometry.setAttribute(`aS${i}`, new THREE.BufferAttribute(f, 3)));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aLayer", new THREE.BufferAttribute(layerOf, 1));
    // three needs a position attribute to size draw calls; the shader never reads it
    geometry.setAttribute("position", new THREE.BufferAttribute(forms[0], 3));

    const uniforms = {
      uFrom: { value: [1, 0, 0, 0, 0] },
      uTo: { value: [1, 0, 0, 0, 0] },
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uPixel: { value: pixel },
      uReveal: { value: 0 },
      uLayer: { value: -1 },
      uStack: { value: 0 },
      uBoost: { value: 1 },
      uPush: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uA: { value: new THREE.Color() },
      uB: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const cloud = new THREE.Points(geometry, material);
    cloud.frustumCulled = false;
    const group = new THREE.Group();
    group.add(cloud);
    scene.add(group);

    /* ---------- a fine line through the ∞, and a comet riding it ---------- */
    const loopLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 321 }, (_, i) => new THREE.Vector3(...loopPoint((i / 320) * Math.PI * 2))),
      ),
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    group.add(loopLine);

    const glow = glowTexture();
    const comet = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    comet.scale.setScalar(0.85);
    group.add(comet);

    /* ---------- the solid objects each chapter gathers around ---------- */
    const core = createCore();
    group.add(core.mesh);
    const plates = createPlates();
    group.add(plates.group);
    const planet = createPlanet(13, -1.25);
    scene.add(planet.group);
    const warp = createWarp(small ? 220 : 640);
    scene.add(warp.lines);
    void document.fonts?.ready.then(plates.redraw);

    /* ---------- far stars, which never morph ---------- */
    const starCount = small ? 1400 : 3600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const r = 45 + Math.random() * 40;
      const q = Math.sqrt(1 - z * z);
      starPos[i * 3] = Math.cos(a) * q * r;
      starPos[i * 3 + 1] = Math.sin(a) * q * r;
      starPos[i * 3 + 2] = z * r - 20;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 1.3 * pixel, sizeAttenuation: false, color: 0xbfd2ea, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    scene.add(stars);

    /* ---------- sunrise behind the last chapter ---------- */
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    sun.position.set(0, -2.1, -3);
    sun.scale.set(30, 6, 1);
    scene.add(sun);

    /* ---------- layout ---------- */
    type Chapter = { key: string; top: number; height: number };
    let chapters: Chapter[] = [];
    const measure = () => {
      const sy = window.scrollY;
      chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { key: el.dataset.chapter ?? "top", top: r.top + sy, height: r.height };
      });
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      composer.setPixelRatio(pixel);
      composer.setSize(w, h);
      camera.aspect = w / h;
      // keep the subject in frame on tall phones by pulling the lens wider
      camera.fov = camera.aspect < 1 ? 58 : 42;
      camera.updateProjectionMatrix();
      measure();
    };

    const readPalette = () => {
      const css = getComputedStyle(html);
      const accent = uniforms.uA.value.set(css.getPropertyValue("--accent").trim());
      const warm = uniforms.uB.value.set(css.getPropertyValue("--accent-2").trim());
      scene.background = new THREE.Color(css.getPropertyValue("--bg").trim());
      (loopLine.material as THREE.LineBasicMaterial).color.copy(accent);
      comet.material.color.copy(accent).lerp(new THREE.Color(0xffffff), 0.35);
      sun.material.color.copy(warm);
      core.uniforms.uColor.value.copy(accent);
      planet.uniforms.uRim.value.copy(warm);
      planet.uniforms.uSky.value.copy(accent);
      warp.uniforms.uColor.value.copy(accent).lerp(new THREE.Color(0xffffff), 0.3);
    };

    /* ---------- the loop ---------- */
    const pointer = new THREE.Vector2(9, 9);
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, seen: false };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.set(mouse.x, -mouse.y);
      mouse.seen = e.pointerType === "mouse";
    };

    const look = new THREE.Vector3();
    const smoothedCam = new THREE.Vector3(0, 0, 8.4);
    const smoothedLook = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const facing = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const onPlane = new THREE.Vector3();
    let raf = 0;
    let spin = 0;
    let last = performance.now();
    const t0 = last;
    let reveal = 0;
    let lastY = window.scrollY;
    let speed = 0;
    let travel = 0;
    let slowFrames = 0;
    let sampled = 0;
    let sampleTime = 0;

    /** Gives up one level of quality; each level is cheaper than the last. */
    const stepDown = () => {
      if (locked || quality >= 3) return;
      quality += 1;
      if (quality === 2) {
        pixel = Math.min(pixel, 1);
        uniforms.uPixel.value = pixel;
        renderer.setPixelRatio(pixel);
        resize();
      }
      if (quality === 3) geometry.setDrawRange(0, Math.floor(COUNT * 0.55));
      canvas.dataset.quality = String(quality);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      const rawDt = now - last;
      last = now;
      const time = (now - t0) / 1000;
      const ready = html.classList.contains("intro-seen") || html.classList.contains("intro-leaving");
      if (!chapters.length) return measure();

      const vh = window.innerHeight;
      const sy = window.scrollY;
      const mid = sy + vh * 0.5;
      let i = chapters.findIndex((c) => mid < c.top + c.height);
      if (i < 0) i = chapters.length - 1;
      const cur = chapters[i];
      const next = chapters[Math.min(i + 1, chapters.length - 1)];
      const a = SHOTS[cur.key] ?? SHOTS.top;
      const b = SHOTS[next.key] ?? a;
      const p = clamp01((mid - cur.top) / cur.height);

      // the hand-over happens across the seam between two chapters
      const seam = cur.top + cur.height;
      const m = next === cur ? 0 : smooth(clamp01((mid - (seam - vh * 0.95)) / (vh * 0.95)));

      // nothing behind a solid chapter needs drawing
      const covered = a.opaque && cur.top <= sy && cur.top + cur.height >= sy + vh;
      if (covered) return;

      // judge the device on real work: visible and past start-up. Only a gap of over a
      // second counts as a hitch; a slow machine must never be mistaken for one.
      if (ready && time > 5 && rawDt < 1000) {
        sampled += 1;
        sampleTime += rawDt;
        // two seconds of frames, so the slowest devices get a verdict as fast as any other
        if (sampleTime >= 2000) {
          slowFrames = sampleTime / sampled > 27 ? slowFrames + 1 : 0;
          sampled = 0;
          sampleTime = 0;
          if (slowFrames >= 2) {
            slowFrames = 0;
            stepDown();
          }
        }
      }

      const weight = (shape: number) => (a.shape === shape ? 1 - m : 0) + (b.shape === shape ? m : 0);
      const loopW = weight(LOOP);
      const sparkW = weight(SPARK);
      const stackW = weight(STACK);
      const tunnelW = weight(TUNNEL);
      const horizonW = weight(HORIZON);

      for (let s = 0; s < SHAPES; s++) {
        uniforms.uFrom.value[s] = s === a.shape ? 1 : 0;
        uniforms.uTo.value[s] = s === b.shape ? 1 : 0;
      }
      uniforms.uMorph.value = a.shape === b.shape ? 0 : m;
      uniforms.uTime.value = reduce ? 0 : time;
      reveal += ((ready ? 1 : 0) - reveal) * Math.min(1, dt * 1.8);
      const shown = reduce ? 1 : smooth(clamp01(reveal));
      uniforms.uReveal.value = shown;

      // skill plates light up one at a time
      uniforms.uStack.value = stackW;
      uniforms.uLayer.value = stackW > 0.01 ? worldState.layer : -1;
      plates.update(worldState.layer, stackW * shown, uniforms.uA.value);

      const shotA = { pos: mixV(a.from.pos, a.to.pos, p), look: mixV(a.from.look, a.to.look, p) };
      const pos = mixV(shotA.pos, b.from.pos, m);
      const lk = mixV(shotA.look, b.from.look, m);
      const narrow = camera.aspect < 1;
      if (narrow) {
        pos[0] = lerp(pos[0], 0, 0.8);
        lk[0] = lerp(lk[0], 0, 0.8);
        // portrait screens are narrow: step back until the whole form fits
        pos[2] *= lerp(1.75, 1, tunnelW);
      }

      const k = reduce ? 1 : Math.min(1, dt * 5);
      mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3);
      mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
      uniforms.uBoost.value = 1 + tunnelW * (small ? 0.15 : 0.6) - horizonW * 0.45;
      const sway = reduce ? 0 : 0.34 * (1 - tunnelW * 0.5);
      smoothedCam.lerp(look.set(pos[0] + mouse.sx * sway, pos[1] - mouse.sy * sway, pos[2]), k);
      smoothedLook.lerp(look.set(lk[0], lk[1], lk[2]), k);
      camera.position.copy(smoothedCam);
      camera.lookAt(smoothedLook);

      // only the free-floating forms turn; a tunnel you're inside must hold still
      if (!reduce) spin += dt * lerp(a.spin, b.spin, m);
      const held = 1 - tunnelW;
      const turning = (a.spin > 0 ? 1 - m : 0) + (b.spin > 0 ? m : 0);
      group.rotation.y = spin * turning * (1 - (a.shape === LOOP ? 1 - m : 0)) + Math.sin(time * 0.15) * 0.12 * held * (1 - stackW);
      group.rotation.x = Math.sin(time * 0.11) * 0.05 * held;

      // the cursor parts the particles wherever it falls on the form
      const touchable = reduce || !mouse.seen ? 0 : Math.max(loopW, sparkW);
      uniforms.uPush.value += (touchable * 0.95 - uniforms.uPush.value) * Math.min(1, dt * 4);
      if (mouse.seen) {
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(facing, onPlane)) {
          group.worldToLocal(onPlane);
          uniforms.uMouse.value.lerp(new THREE.Vector2(onPlane.x, onPlane.y), Math.min(1, dt * 9));
        }
      }

      // ∞ line and comet belong only to the loop form
      (loopLine.material as THREE.LineBasicMaterial).opacity = 0.42 * loopW * shown;
      comet.material.opacity = loopW * shown;
      // in the process chapter scroll rides the comet round; otherwise it circles on its own
      const ride = cur.key === "process" ? p * Math.PI * 2 - Math.PI / 2 : time * 0.35;
      comet.position.set(...loopPoint(ride));

      core.mesh.visible = sparkW > 0.01;
      core.uniforms.uOpacity.value = sparkW * shown;
      core.uniforms.uTime.value = time;

      planet.group.visible = horizonW > 0.01;
      planet.uniforms.uOpacity.value = horizonW;
      sun.material.opacity = 0.2 * horizonW;

      // scroll speed drives the streaks: still when you stop, long when you fling it
      const flung = Math.abs(sy - lastY) / Math.max(0.008, dt);
      lastY = sy;
      speed += (Math.min(1, flung / 2600) - speed) * Math.min(1, dt * 6);
      travel += (2 + speed * 90) * dt;
      warp.lines.visible = tunnelW > 0.01 && !reduce;
      warp.lines.position.z = camera.position.z;
      warp.uniforms.uTravel.value = travel;
      warp.uniforms.uStretch.value = speed * 7;
      warp.uniforms.uOpacity.value = tunnelW * (0.2 + speed * 0.8);

      stars.position.z = camera.position.z * 0.08;
      if (quality === 0) composer.render();
      else renderer.render(scene, camera);
    };

    readPalette();
    resize();
    canvas.dataset.quality = String(quality);
    raf = requestAnimationFrame(frame);

    const mo = new MutationObserver(readPalette);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    const onVisible = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisible);
      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      glow.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-[100lvh] w-full" />;
}
