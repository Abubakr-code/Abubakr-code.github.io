// Point-cloud shapes for <MorphScene />. Each shape is (i, n) => [x, y, z, colour]
// where colour indexes MORPH_PALETTE. Shapes fit a ~2.4 radius around the origin.
import { PALETTE } from "./materials";

export const MORPH_PALETTE = [PALETTE.grey, PALETTE.accent, PALETTE.accentSoft, PALETTE.ink, PALETTE.threat, "#d9d9d2"];
const G = 0;
const A = 1;
const S = 2;
const I = 3;
const R = 4;

const rnd = (a = 1) => (Math.random() * 2 - 1) * a;
const onSphere = (r) => {
  const u = rnd();
  const a = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r];
};
const inBall = (r) => onSphere(r * Math.cbrt(Math.random()));
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// Rows of "code": [indent, length] per line.
const CODE_ROWS = [
  [0, 2.6], [0.3, 3.4], [0.6, 2.2], [0.6, 3.6], [0.9, 2.8], [0.6, 1.6], [0.3, 1.0], [0, 3.0],
  [0.3, 3.8], [0.6, 2.0], [0.9, 3.2], [0.9, 2.4], [0.6, 1.4], [0.3, 2.6], [0, 1.2], [0, 2.8],
];
const codeRow = (rows, top, gap, colourOf) => {
  const row = (Math.random() * rows) | 0;
  const [indent, len] = CODE_ROWS[row % CODE_ROWS.length];
  const d = Math.random() * len;
  const x = -2.3 + indent + d;
  return [x, top - row * gap, -0.12 * x * x + rnd(0.03), colourOf(row, d)];
};

/* ── generic ─────────────────────────────────────────── */

export const cloud = () => {
  const [x, y, z] = inBall(2.6);
  return [x * 1.3, y, z, Math.random() < 0.15 ? A : G];
};

// Sealed shell, data core inside, dashed outer ring = the air gap.
export const airgap = (i, n) => {
  const f = i / n;
  if (f < 0.2) return [...inBall(0.8), A];
  if (f < 0.78) return [...onSphere(1.9), G];
  const seg = Math.PI / 8;
  let a = Math.random() * Math.PI * 2;
  if (Math.floor(a / seg) % 2) a -= seg;
  return [Math.cos(a) * 2.7, rnd(0.04), Math.sin(a) * 2.7, I];
};

/* ── AST tree ────────────────────────────────────────── */

const TREE = (() => {
  const nodes = [{ p: [0, 2.1, 0], d: 0 }];
  const edges = [];
  const grow = (parent, depth) => {
    if (depth === 3) return;
    const kids = depth === 0 ? 3 : 2 + (Math.random() < 0.5 ? 1 : 0);
    const w = [1.7, 0.75, 0.38][depth];
    for (let k = 0; k < kids; k++) {
      const a = (k / kids) * Math.PI * 2 + depth * 0.7 + rnd(0.2);
      const child = { p: [parent.p[0] + Math.cos(a) * w, parent.p[1] - 1.35, parent.p[2] + Math.sin(a) * w], d: depth + 1 };
      nodes.push(child);
      edges.push([parent.p, child.p]);
      grow(child, depth + 1);
    }
  };
  grow(nodes[0], 0);
  return { nodes, edges };
})();

export const tree = (i) => {
  if (i % 3 === 0) {
    const idx = (i / 3) % TREE.nodes.length;
    const node = TREE.nodes[idx];
    const c = node.d === 0 ? I : node.d === 3 && idx % 5 === 2 ? R : A;
    return [...add3(node.p, inBall(0.14)), c];
  }
  const [a, b] = pick(TREE.edges);
  return [...add3(lerp3(a, b, Math.random()), inBall(0.02)), G];
};

/* ── neural engine ───────────────────────────────────── */

const LAYERS = [4, 6, 6, 3].map((count, l) =>
  Array.from({ length: count }, (_, k) => [-2.3 + l * 1.53, (k - (count - 1) / 2) * 0.72, (k % 2 ? 0.35 : -0.35) * (l % 2 ? 1 : -1)])
);

export const neural = (i) => {
  if (i % 3 === 0) {
    const l = (Math.random() * LAYERS.length) | 0;
    return [...add3(pick(LAYERS[l]), inBall(0.13)), l === LAYERS.length - 1 ? I : A];
  }
  const l = (Math.random() * (LAYERS.length - 1)) | 0;
  const a = pick(LAYERS[l]);
  const b = pick(LAYERS[l + 1]);
  return [...add3(lerp3(a, b, Math.random()), inBall(0.015)), Math.random() < 0.12 ? S : G];
};

/* ── code, diff, report ──────────────────────────────── */

export const codePage = () =>
  codeRow(16, 2.0, 0.26, (row, d) => (d < 0.3 ? S : row % 5 === 2 && d > 0.8 && d < 1.6 ? A : G));

// Removed lines in red, added lines in accent, plus a gutter.
export const patch = (i) => {
  if (i % 9 === 0) {
    const row = (Math.random() * 16) | 0;
    return [-2.75, 2.0 - row * 0.26, 0.05, 5];
  }
  return codeRow(16, 2.0, 0.26, (row, d) => (row === 6 || row === 7 ? R : row === 8 || row === 9 ? A : d < 0.3 ? S : G));
};

export const report = (i, n) => {
  const f = i / n;
  const W = 1.6;
  const H = 2.1;
  if (f < 0.22) {
    // page outline
    const t = Math.random() * 4;
    const e = Math.floor(t);
    const u = t - e;
    const p = e === 0 ? [-W + 2 * W * u, H] : e === 1 ? [W, H - 2 * H * u] : e === 2 ? [W - 2 * W * u, -H] : [-W, -H + 2 * H * u];
    return [p[0], p[1], 0, I];
  }
  if (f < 0.34) return [-W + 0.25 + Math.random() * 1.6, H - 0.35 - Math.random() * 0.3, 0.02, A];
  if (f < 0.8) {
    const row = (Math.random() * 9) | 0;
    const len = [2.6, 2.2, 2.8, 1.8, 2.5, 2.0, 2.7, 1.4, 2.3][row];
    return [-W + 0.25 + Math.random() * len, H - 0.95 - row * 0.28, 0.02, G];
  }
  // seal
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() < 0.6 ? 0.5 : 0.36;
  return [0.85 + Math.cos(a) * r, -1.45 + Math.sin(a) * r, 0.08, A];
};

/* ── install & taint ─────────────────────────────────── */

export const packageCube = (i) => {
  const s = 1.3;
  if (i % 5 < 3) {
    const t = rnd(s);
    const a = Math.random() < 0.5 ? -s : s;
    const b = Math.random() < 0.5 ? -s : s;
    const axis = i % 3;
    return [...(axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t]), A];
  }
  if (i % 5 === 3) return [...inBall(0.7), I];
  const face = [rnd(s), rnd(s), Math.random() < 0.5 ? -s : s];
  const k = i % 3;
  return [face[(k + 0) % 3], face[(k + 1) % 3], face[(k + 2) % 3], S];
};

const GRAPH = (() => {
  const nodes = Array.from({ length: 14 }, (_, k) => {
    const a = k * 1.1;
    return [Math.cos(a) * (1.2 + (k % 3) * 0.45), 2.0 - k * 0.3, Math.sin(a) * (1.2 + (k % 3) * 0.45)];
  });
  const path = [0, 3, 6, 9, 13];
  const edges = [];
  for (let k = 0; k < 13; k++) edges.push([k, k + 1, false]);
  for (let k = 0; k < path.length - 1; k++) edges.push([path[k], path[k + 1], true]);
  return { nodes, edges };
})();

const PATH_EDGES = GRAPH.edges.filter((e) => e[2]);

export const taint = (i) => {
  const { nodes, edges } = GRAPH;
  if (i % 4 === 0) {
    const k = (i / 4) % nodes.length;
    return [...add3(nodes[k], inBall(0.16)), k === 0 ? A : k === 13 ? R : I];
  }
  // Path edges get extra points so the taint route reads first.
  const e = i % 3 === 0 ? pick(PATH_EDGES) : pick(edges);
  return [...add3(lerp3(nodes[e[0]], nodes[e[1]], Math.random()), inBall(0.02)), e[2] ? A : G];
};

/* ── cost story ──────────────────────────────────────── */

export const coins = (i) => {
  const stacks = [
    [-1.35, 8],
    [0, 13],
    [1.35, 5],
  ];
  const [cx, h] = stacks[i % 3];
  const level = (Math.random() * h) | 0;
  const a = Math.random() * Math.PI * 2;
  const top = level === h - 1 && Math.random() < 0.5;
  const r = top ? 0.55 * Math.sqrt(Math.random()) : 0.55;
  return [cx + Math.cos(a) * r, -1.9 + level * 0.24 + (top ? 0.1 : rnd(0.08)), Math.sin(a) * r, top ? (i % 3 === 1 ? A : I) : G];
};

export const hourglass = (i, n) => {
  const f = i / n;
  if (f < 0.5) {
    const y = rnd(2);
    const r = 0.12 + 0.62 * Math.abs(y);
    const a = Math.random() * Math.PI * 2;
    return [Math.cos(a) * r, y, Math.sin(a) * r, Math.abs(Math.abs(y) - 2) < 0.08 ? I : G];
  }
  if (f < 0.6) return [rnd(0.03), -Math.random() * 1.3, rnd(0.03), A];
  // sand: small heap on top, bigger heap below
  const below = f > 0.72;
  const y = below ? -2 + Math.random() * 0.9 : 0.25 + Math.random() * 0.55;
  const max = (0.12 + 0.62 * Math.abs(y)) * (below ? (1 - (y + 2) / 0.9) : 1);
  const a = Math.random() * Math.PI * 2;
  const r = Math.max(0.02, max) * Math.sqrt(Math.random());
  return [Math.cos(a) * r, y, Math.sin(a) * r, A];
};

export const laptop = (i) => {
  const tilt = 0.25;
  if (i % 2 === 0) {
    // deck
    const x = Math.round(rnd(2.1) / 0.14) * 0.14;
    const z = Math.round(Math.random() * 1.6 / 0.14) * 0.14 - 0.2;
    const rim = Math.abs(Math.abs(x) - 2.1) < 0.08 || z < -0.15 || z > 1.3;
    return [x, -1.1, z, rim ? I : G];
  }
  const v = Math.random() * 2.6;
  const u = rnd(2.1);
  const screen = (q) => [u, -1.1 + q * Math.cos(tilt), -0.25 - q * Math.sin(tilt)];
  if (Math.abs(Math.abs(u) - 2.1) < 0.05 || v < 0.05 || v > 2.55) return [...screen(v), A];
  const row = Math.floor(v / 0.2);
  const [indent, len] = CODE_ROWS[row % CODE_ROWS.length];
  const from = -1.9 + indent * 0.9;
  if (v < 0.2 || v > 2.4 || u < from || u > from + len * 0.9) return laptop(i);
  return [...screen((row + 0.5) * 0.2), row % 4 === 1 ? A : G];
};

/* ── why / inside ────────────────────────────────────── */

// Signal waves leave the emitter and stop dead at the wall.
export const waves = (i, n) => {
  const f = i / n;
  if (f < 0.1) return [-2.4 + rnd(0.03), -1.8 + Math.random() * 2, rnd(0.03), I];
  if (f < 0.55) {
    const r = 0.5 + ((Math.random() * 5) | 0) * 0.5;
    const a = rnd(0.9);
    const b = rnd(0.5);
    const x = -2.4 + Math.cos(a) * Math.cos(b) * r;
    if (x > 0.2) return waves(i, n);
    return [x, 0.2 + Math.sin(a) * r, Math.sin(b) * r, G];
  }
  const y = rnd(1.9);
  const z = rnd(1.3);
  return [0.45, Math.round(y / 0.18) * 0.18, Math.round(z / 0.18) * 0.18, A];
};

export const memory = () => {
  const cx = (Math.random() * 8) | 0;
  const cy = (Math.random() * 5) | 0;
  const dx = ((Math.random() * 3) | 0) * 0.12;
  const dy = ((Math.random() * 3) | 0) * 0.12;
  const c = cy === 2 && cx >= 1 && cx <= 4 ? A : cy === 2 && cx >= 5 && cx <= 6 ? R : G;
  const lift = c === R ? 0.25 : 0;
  return [-2.3 + cx * 0.62 + dx, 1.4 - cy * 0.62 + dy, rnd(0.05) + lift, c];
};

export const infinity = (i) => {
  const t = Math.random() * Math.PI * 2;
  const d = 1 + Math.sin(t) ** 2;
  const p = [(2.4 * Math.cos(t)) / d, (2.4 * Math.sin(t) * Math.cos(t)) / d, 0.45 * Math.sin(t)];
  if (i % 11 === 0) {
    const bead = (Math.round((t / (Math.PI * 2)) * 6) / 6) * Math.PI * 2;
    const db = 1 + Math.sin(bead) ** 2;
    return [...add3([(2.4 * Math.cos(bead)) / db, (2.4 * Math.sin(bead) * Math.cos(bead)) / db, 0.45 * Math.sin(bead)], inBall(0.12)), I];
  }
  return [...add3(p, inBall(0.12)), Math.random() < 0.7 ? A : S];
};

export const seal = (i, n) => {
  const f = i / n;
  const a = Math.random() * Math.PI * 2;
  if (f < 0.4) {
    const r = Math.random() < 0.55 ? 2.0 : 1.72;
    return [Math.cos(a) * r, Math.sin(a) * r, rnd(0.03), A];
  }
  if (f < 0.6) {
    const t = Math.round((a / (Math.PI * 2)) * 48) / 48 * Math.PI * 2;
    const r = 1.78 + Math.random() * 0.16;
    return [Math.cos(t) * r * 1.0, Math.sin(t) * r, 0, I];
  }
  if (f < 0.8) {
    // check mark
    const t = Math.random();
    const p = t < 0.35 ? lerp3([-0.7, 0.05, 0.1], [-0.15, -0.5, 0.1], t / 0.35) : lerp3([-0.15, -0.5, 0.1], [0.75, 0.6, 0.1], (t - 0.35) / 0.65);
    return [...add3(p, inBall(0.05)), I];
  }
  const r = 1.4 * Math.sqrt(Math.random());
  return [Math.cos(a) * r, Math.sin(a) * r, -0.05, S];
};
