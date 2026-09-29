import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import SceneCanvas from "../../three/SceneCanvas";
import { PALETTE, createDotMaterial, syncViewport } from "../../three/materials";

const COUNT = 3000;
const grey = new THREE.Color(PALETTE.grey);
const accent = new THREE.Color(PALETTE.accent);
const soft = new THREE.Color(PALETTE.accentSoft);

const randomOnSphere = (r) => {
  const u = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r];
};

// Four target shapes, one per stat. Each returns [x,y,z] and a colour per index.
const SHAPES = [
  // 0 B egress — sealed shell, the data (accent) stays inside.
  (i) => {
    if (i < COUNT * 0.22) {
      const [x, y, z] = randomOnSphere(Math.cbrt(Math.random()) * 0.75);
      return [[x, y, z], accent];
    }
    return [randomOnSphere(2.2 + (Math.random() - 0.5) * 0.06), grey];
  },
  // 15,482 signatures — an index lattice, some cells lit.
  (i) => {
    const n = 14;
    const cell = i % (n * n * n);
    const gx = cell % n;
    const gy = Math.floor(cell / n) % n;
    const gz = Math.floor(cell / (n * n));
    const s = 3.3 / (n - 1);
    const p = [(gx - (n - 1) / 2) * s, (gy - (n - 1) / 2) * s, (gz - (n - 1) / 2) * s];
    return [p, (i * 2654435761) % 100 < 16 ? accent : grey];
  },
  // 1M+ LOC/min — rows of code streaming past.
  (i) => {
    const rows = 22;
    const row = i % rows;
    const indent = [0, 0.4, 0.8, 0.8, 0.4, 0, 0.4, 1.2, 1.2, 0.8, 0.4][row % 11];
    const len = 2.2 + ((row * 37) % 10) / 10 * 2.6;
    const x = -2.8 + indent + Math.random() * len;
    return [[x, 2.1 - row * 0.2, (Math.random() - 0.5) * 0.25], row % 5 === 2 ? accent : grey];
  },
  // 100% offline — one closed ring.
  (i) => {
    const a = (i / COUNT) * Math.PI * 2 * 7.3;
    const r = 2 + Math.sin(a * 3) * 0.02 + (Math.random() - 0.5) * 0.28;
    return [[Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.3], Math.random() < 0.75 ? accent : soft];
  },
];

const buildGeometry = () => {
  const g = new THREE.BufferGeometry();
  const base = new Float32Array(COUNT * 3);
  g.setAttribute("position", new THREE.BufferAttribute(base, 3));
  SHAPES.forEach((shape, s) => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const [p, c] = shape(i);
      pos.set(p, i * 3);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute(`aPos${s}`, new THREE.BufferAttribute(pos, 3));
    g.setAttribute(`aCol${s}`, new THREE.BufferAttribute(col, 3));
  });
  const delay = new Float32Array(COUNT).map(() => Math.random());
  const scale = new Float32Array(COUNT).map(() => 0.7 + Math.random() * 0.7);
  g.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
  g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  return g;
};

// Morph between shape floor(uStage) and the next on the GPU, with per-point stagger.
const morphShader = {
  vertexHead: /* glsl */ `
    attribute vec3 aPos0; attribute vec3 aPos1; attribute vec3 aPos2; attribute vec3 aPos3;
    attribute vec3 aCol0; attribute vec3 aCol1; attribute vec3 aCol2; attribute vec3 aCol3;
    attribute float aDelay;
    uniform float uStage;
    uniform float uTime;
    vec3 pickPos(float i) { return i < 0.5 ? aPos0 : i < 1.5 ? aPos1 : i < 2.5 ? aPos2 : aPos3; }
    vec3 pickCol(float i) { return i < 0.5 ? aCol0 : i < 1.5 ? aCol1 : i < 2.5 ? aCol2 : aCol3; }
  `,
  vertexBody: /* glsl */ `
    float i0 = floor(uStage);
    float f = uStage - i0;
    float k = smoothstep(0.0, 1.0, clamp(f * 1.6 - aDelay * 0.6, 0.0, 1.0));
    vec3 a = pickPos(i0);
    vec3 b = pickPos(min(i0 + 1.0, 3.0));
    // Code rows keep flowing while stage 2 is shown.
    float flow = 1.0 - min(abs(uStage - 2.0), 1.0);
    if (flow > 0.0) {
      float row = floor((2.1 - aPos2.y) / 0.2 + 0.5);
      float sx = mod(aPos2.x + 2.8 + uTime * (0.35 + mod(row, 3.0) * 0.15), 5.8) - 2.8;
      vec3 flowing = vec3(sx, aPos2.y, aPos2.z);
      if (i0 == 2.0) a = flowing;
      if (i0 == 1.0) b = mix(aPos2, flowing, flow);
    }
    pos = mix(a, b, k);
    pos += 0.03 * vec3(sin(uTime + aDelay * 30.0), cos(uTime * 0.8 + aDelay * 20.0), 0.0);
    col = mix(pickCol(i0), pickCol(min(i0 + 1.0, 3.0)), k);
  `,
};

const Morph = ({ stage }) => {
  const group = useRef();
  const size = useThree((s) => s.size);
  const geometry = useMemo(buildGeometry, []);
  const material = useMemo(
    () =>
      createDotMaterial({
        size: 0.05,
        extraUniforms: { uStage: { value: 0 }, uTime: { value: 0 } },
        ...morphShader,
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    syncViewport(material, size);
    const u = material.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uStage.value += (stage.current - u.uStage.value) * (1 - Math.exp(-delta * 3));
    // Sway rather than spin, so flat shapes (rows, ring) never turn edge-on.
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.55;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.12 + 0.15;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

const NumbersScene = ({ stage }) => (
  <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0, 8.5], fov: 42 }}>
    <Morph stage={stage} />
  </SceneCanvas>
);

export default NumbersScene;
