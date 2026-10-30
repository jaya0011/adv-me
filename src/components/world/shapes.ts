/** The forms one cloud of particles takes on the way down the page. All in world units. */

const TAU = Math.PI * 2;

/** Roughly normal, in about -1…1, so bands stay dense at the core and soft at the edge. */
const soft = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export const LOOP_A = 3.5;

/** Point on the ∞, slightly twisted in depth so it reads as an object rather than a logo. */
export function loopPoint(t: number): [number, number, number] {
  const s = Math.sin(t);
  const c = Math.cos(t);
  const d = 1 + s * s;
  return [(LOOP_A * c) / d, (LOOP_A * 1.15 * s * c) / d, 0.55 * Math.sin(t * 2 + 0.6)];
}

export function infinity(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.random() * TAU;
    const [x, y, z] = loopPoint(t);
    const [x2, y2] = loopPoint(t + 0.01);
    const len = Math.hypot(x2 - x, y2 - y) || 1;
    // band across the curve, thin in depth: a ribbon, not a tube
    const across = soft() * 0.3;
    out[i * 3] = x + (-(y2 - y) / len) * across;
    out[i * 3 + 1] = y + ((x2 - x) / len) * across;
    out[i * 3 + 2] = z + soft() * 0.1;
  }
  return out;
}

/** A dense spark with three thin orbits around it. */
export function spark(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const kind = Math.random();
    if (kind < 0.62) {
      // fibonacci shell, roughened so the surface looks alive
      const u = (i + 0.5) / n;
      const phi = Math.acos(1 - 2 * ((u * 7.3) % 1));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.25 + Math.pow(Math.random(), 3) * 0.5;
      out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      out[i * 3 + 2] = r * Math.cos(phi);
    } else {
      const ring = Math.floor(Math.random() * 3);
      const a = Math.random() * TAU;
      const r = 2.15 + ring * 0.42 + soft() * 0.02;
      const tilt = 0.5 + ring * 0.7;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      out[i * 3] = x;
      out[i * 3 + 1] = z * Math.sin(tilt) + soft() * 0.02;
      out[i * 3 + 2] = z * Math.cos(tilt);
    }
  }
  return out;
}

export const LAYERS = 6;
export const LAYER_GAP = 1.15;

/** Six plates, one per part of the stack. Writes which plate each particle sits on. */
export function stack(n: number, layerOf: Float32Array) {
  const out = new Float32Array(n * 3);
  const size = 3.1;
  const cells = 46;
  for (let i = 0; i < n; i++) {
    const layer = i % LAYERS;
    layerOf[i] = layer;
    const edge = Math.random() < 0.22;
    let x: number;
    let z: number;
    if (edge) {
      // bright rim, so each plate reads as a solid slab
      const side = Math.floor(Math.random() * 4);
      const a = (Math.random() * 2 - 1) * size;
      x = side < 2 ? a : side === 2 ? size : -size;
      z = side < 2 ? (side === 0 ? size : -size) : a;
    } else {
      x = (Math.round((Math.random() * 2 - 1) * cells) / cells) * size;
      z = (Math.round((Math.random() * 2 - 1) * cells) / cells) * size;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = (LAYERS / 2 - 0.5 - layer) * LAYER_GAP + soft() * 0.012;
    out[i * 3 + 2] = z;
  }
  return out;
}

export const TUNNEL_LENGTH = 46;

/** Ribs of light you fly through. */
export function tunnel(n: number) {
  const out = new Float32Array(n * 3);
  const ribs = 70;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const rib = Math.floor(Math.random() * ribs);
    const onRib = Math.random() < 0.72;
    const z = 8 - (onRib ? rib / ribs : Math.random()) * TUNNEL_LENGTH;
    const r = 5.2 + (onRib ? soft() * 0.05 : soft() * 0.6);
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = Math.sin(a) * r * 0.72;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** A planet's limb rising at the bottom of the frame. */
export function horizon(n: number) {
  const out = new Float32Array(n * 3);
  const R = 13;
  for (let i = 0; i < n; i++) {
    // weighted towards the top of the sphere: that's the only part in shot
    const y = 1 - Math.pow(Math.random(), 2.4) * 0.42;
    const a = Math.random() * TAU;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const noise = 1 + Math.sin(a * 9 + y * 40) * 0.006;
    out[i * 3] = Math.cos(a) * rr * R * noise;
    out[i * 3 + 1] = y * R - R - 1.25;
    out[i * 3 + 2] = Math.sin(a) * rr * R * noise;
  }
  return out;
}
