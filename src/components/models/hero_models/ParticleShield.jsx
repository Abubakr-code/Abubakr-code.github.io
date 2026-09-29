import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { PALETTE, createDotMaterial, syncViewport } from "../../three/materials";
import { useTheme } from "../../../theme";

// Heater-shield outline in 2D, x ∈ [-1, 1], y ∈ [-1.3, 1].
const outline = (() => {
  const pts = [];
  const push = (x, y) => pts.push(new THREE.Vector2(x, y));
  for (let i = 0; i <= 40; i++) {
    const x = -1 + (i / 40) * 2;
    push(x, 0.92 + 0.08 * (1 - x * x));
  }
  for (let i = 1; i <= 20; i++) push(1, 0.92 - (i / 20) * 0.77);
  const curve = new THREE.QuadraticBezierCurve(new THREE.Vector2(1, 0.15), new THREE.Vector2(0.98, -0.8), new THREE.Vector2(0, -1.3));
  curve.getPoints(40).slice(1).forEach((p) => push(p.x, p.y));
  const n = pts.length;
  for (let i = n - 2; i >= 0; i--) push(-pts[i].x, pts[i].y);
  return pts;
})();

const inside = (x, y) => {
  let hit = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i];
    const b = outline[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
};

// Keyhole: circle + tapering slot.
const inKeyhole = (x, y) => {
  if (x * x + (y - 0.2) ** 2 < 0.2 * 0.2) return true;
  if (y < 0.12 && y > -0.52) {
    const half = 0.07 + (0.12 - y) * 0.12;
    return Math.abs(x) < half;
  }
  return false;
};

const SCALE = 2.55;
const lift = (x, y) => 0.42 * (1 - x * x) - 0.08 * y * y;

const buildShield = (count) => {
  const pos = [];
  const col = [];
  const scl = [];
  const threat = [];
  const soft = new THREE.Color(PALETTE.accentSoft);
  const accent = new THREE.Color(PALETTE.accent);
  const ink = new THREE.Color(PALETTE.ink);
  const red = new THREE.Color(PALETTE.threat);

  const add = (x, y, c, s, isThreat = 0) => {
    const z = lift(x, y) + (Math.random() - 0.5) * 0.04;
    pos.push(x * SCALE, y * SCALE, z * SCALE);
    col.push(c.r, c.g, c.b);
    scl.push(s);
    threat.push(isThreat);
  };

  // Plate fill — denser towards the rim, like a limb-darkened globe.
  let placed = 0;
  while (placed < count) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2.3 - 1.3;
    if (!inside(x, y) || inKeyhole(x, y)) continue;
    const edge = Math.min(1 - Math.abs(x), 1 - y);
    if (Math.random() > 0.35 + (1 - Math.min(1, edge * 3)) * 0.65) continue;
    const isThreat = Math.random() < 0.012 ? 1 : 0;
    add(x, y, isThreat ? red : soft, isThreat ? 1.8 : 0.8 + Math.random() * 0.5, isThreat);
    placed++;
  }

  // Rim and inner rim.
  for (let i = 0; i < 900; i++) {
    // Interpolate between neighbouring outline vertices so the rim is continuous.
    const j = (Math.random() * (outline.length - 1)) | 0;
    const f = Math.random();
    const x = outline[j].x + (outline[j + 1].x - outline[j].x) * f + (Math.random() - 0.5) * 0.02;
    const y = outline[j].y + (outline[j + 1].y - outline[j].y) * f + (Math.random() - 0.5) * 0.02;
    const k = i % 3 === 0 ? 0.84 : 1;
    add(x * k, y * k + (k < 1 ? -0.05 : 0), accent, k < 1 ? 0.8 : 1 + Math.random() * 0.3);
  }

  // Solid ink keyhole — the one dark shape on the plate.
  let inked = 0;
  while (inked < 520) {
    const x = (Math.random() - 0.5) * 0.44;
    const y = 0.42 - Math.random() * 0.96;
    if (!inKeyhole(x, y)) continue;
    add(x, y, ink, 1.05);
    inked++;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aScale", new THREE.Float32BufferAttribute(scl, 1));
  g.setAttribute("aThreat", new THREE.Float32BufferAttribute(threat, 1));
  g.setAttribute("aRand", new THREE.Float32BufferAttribute(threat.map(() => Math.random()), 1));
  return g;
};

// A vertical scan band sweeps the plate: dots in the band swell and saturate,
// red "threat" dots behind the band are neutralised to accent blue.
// uOut (hero scroll progress) pours the plate downward into the next section.
const scanShader = {
  vertexHead: /* glsl */ `
    attribute float aThreat;
    attribute float aRand;
    uniform float uScan;
    uniform float uOut;
    uniform vec3 uAccent;
  `,
  vertexBody: /* glsl */ `
    float o = smoothstep(0.0, 1.0, clamp(uOut * 1.3 - aRand * 0.3, 0.0, 1.0));
    pos.y -= o * o * (3.0 + aRand * 7.0);
    pos.x += (aRand - 0.5) * o * 4.0;
    pos.z += (fract(aRand * 7.31) - 0.5) * o * 4.0;
    scale *= 1.0 - o * 0.45;
    float band = exp(-pow((pos.y - uScan) * 3.2, 2.0));
    scale *= 1.0 + band * 1.1;
    col = mix(col, uAccent, band * 0.85);
    float cleared = step(uScan, pos.y);
    col = mix(col, uAccent, aThreat * cleared);
  `,
};

const Orbit = ({ scroll }) => {
  const sat = useRef();
  const lineColor = useTheme() === "dark" ? "#efefeb" : PALETTE.ink;
  const curve = useMemo(() => new THREE.EllipseCurve(0, 0, 4.4, 1.25, 0, Math.PI * 2), []);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: PALETTE.ink, dashSize: 0.08, gapSize: 0.08, transparent: true, opacity: 0.35 }));
    l.computeLineDistances();
    return l;
  }, [curve]);

  useFrame(({ clock }) => {
    const p = curve.getPoint((clock.elapsedTime * 0.06) % 1);
    sat.current.position.set(p.x, p.y, 0);
    const fade = 1 - Math.min(1, (scroll?.current ?? 0) * 2.5);
    line.material.opacity = 0.35 * fade;
    sat.current.scale.setScalar(Math.max(0.001, fade));
    line.material.color.set(lineColor);
  });

  return (
    <group rotation={[1.25, 0.25, -0.18]}>
      <primitive object={line} />
      <group ref={sat}>
        <mesh>
          <boxGeometry args={[0.13, 0.13, 0.13]} />
          <meshBasicMaterial color={lineColor} />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.28, 0.035, 0.035]} />
          <meshBasicMaterial color={PALETTE.accent} />
        </mesh>
      </group>
    </group>
  );
};

const ParticleShield = ({ count = 2600, scroll }) => {
  const group = useRef();
  const size = useThree((s) => s.size);
  const geometry = useMemo(() => buildShield(count), [count]);
  const material = useMemo(
    () =>
      createDotMaterial({
        size: 0.055,
        extraUniforms: { uScan: { value: 3 }, uOut: { value: 0 }, uAccent: { value: new THREE.Color(PALETTE.accent) } },
        ...scanShader,
      }),
    []
  );

  useFrame(({ clock, pointer }, delta) => {
    syncViewport(material, size);
    const t = clock.elapsedTime;
    // Sweep top → bottom every 4.5 s, then pause off-plate.
    const cycle = (t % 6) / 4.5;
    material.uniforms.uScan.value = cycle <= 1 ? 3 - cycle * 6.6 : -4;
    const out = scroll?.current ?? 0;
    material.uniforms.uOut.value = out;
    const k = 1 - Math.exp(-delta * 2.5);
    // Scrolling away turns the shield like a camera orbit while it dissolves.
    group.current.rotation.y += (Math.sin(t * 0.25) * 0.35 + pointer.x * 0.35 + out * Math.PI * 0.9 - group.current.rotation.y) * k;
    group.current.rotation.x += (-pointer.y * 0.2 - group.current.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} />
      <Orbit scroll={scroll} />
    </group>
  );
};

export default ParticleShield;
