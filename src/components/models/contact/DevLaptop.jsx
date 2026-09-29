import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { PALETTE, createDotMaterial, syncViewport } from "../../three/materials";
import { useTheme } from "../../../theme";

// Particle laptop: keyboard deck + tilted screen of code. A scan band runs
// down the screen and red findings turn accent once it has passed. An offline
// package (dotted cube) streams into the screen — the install, visualised.

const W = 4.2; // deck width
const D = 2.8; // deck depth
const BASE_Y = -1.1;
const HINGE_Z = -D / 2;
const SCREEN_H = 2.7;
const TILT = THREE.MathUtils.degToRad(14);
const NO_SCREEN = -10;

// Screen-local (u, v) → world; v runs up from the hinge, `lift` along the
// screen normal towards the viewer.
const onScreen = (u, v, lift = 0) => [
  u,
  BASE_Y + v * Math.cos(TILT) + lift * Math.sin(TILT),
  HINGE_Z - v * Math.sin(TILT) + lift * Math.cos(TILT),
];

const buildLaptop = () => {
  const pos = [];
  const col = [];
  const scl = [];
  const threat = [];
  const vArr = [];
  const c = {
    ink: new THREE.Color(PALETTE.ink),
    grey: new THREE.Color(PALETTE.grey),
    line: new THREE.Color("#d9d9d2"),
    accent: new THREE.Color(PALETTE.accent),
    soft: new THREE.Color(PALETTE.accentSoft),
    red: new THREE.Color(PALETTE.threat),
  };
  const add = (p, color, s, v = NO_SCREEN, isThreat = 0) => {
    pos.push(...p);
    col.push(color.r, color.g, color.b);
    scl.push(s);
    vArr.push(v);
    threat.push(isThreat);
  };

  // Rounded-rectangle outline sampled at a fixed spacing.
  const rect = (x0, x1, a0, a1, step, emit) => {
    for (let x = x0; x <= x1 + 1e-6; x += step) {
      emit(x, a0);
      emit(x, a1);
    }
    for (let a = a0 + step; a < a1 - 1e-6; a += step) {
      emit(x0, a);
      emit(x1, a);
    }
  };

  // Deck rim, top and bottom edge, so it reads as a slab.
  rect(-W / 2, W / 2, -D / 2, D / 2, 0.05, (x, z) => add([x, BASE_Y, z], c.ink, 0.9));
  rect(-W / 2, W / 2, -D / 2, D / 2, 0.1, (x, z) => add([x, BASE_Y - 0.12, z], c.grey, 0.7));

  // Keyboard: 5 rows × 13 keys, each key a 3×3 dot tile; a wide space bar.
  const keyW = 0.26;
  for (let r = 0; r < 5; r++) {
    const z = -1.15 + r * 0.29;
    for (let k = 0; k < 13; k++) {
      const x = -1.74 + k * 0.29;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) add([x + (i / 2) * keyW * 0.7, BASE_Y + 0.01, z + (j / 2) * keyW * 0.7], c.grey, 0.75);
    }
  }
  for (let x = -0.9; x <= 0.9; x += 0.06)
    for (let j = 0; j < 3; j++) add([x, BASE_Y + 0.01, 0.3 + j * 0.09], c.grey, 0.75);

  // Trackpad outline.
  rect(-0.65, 0.65, 0.6, 1.2, 0.06, (x, z) => add([x, BASE_Y + 0.01, z], c.grey, 0.8));

  // Screen: bezel, faint panel grid, then code rows.
  rect(-W / 2, W / 2, 0, SCREEN_H, 0.045, (u, v) => add(onScreen(u, v), c.accent, 1));
  for (let u = -1.95; u <= 1.95; u += 0.13)
    for (let v = 0.15; v <= SCREEN_H - 0.15; v += 0.13) add(onScreen(u, v, 0.02), c.line, 0.7, v);

  const indents = [0, 0.3, 0.6, 0.6, 0.9, 0.6, 0.3, 0, 0.3, 0.6, 0.9, 0.9, 0.6, 0.3];
  const lengths = [1.6, 2.2, 1.4, 2.6, 1.9, 1.2, 0.8, 2.0, 2.4, 1.1, 2.7, 1.5, 1.0, 0.6];
  const findings = { 3: [0.9, 1.6], 10: [1.5, 2.3] }; // row → [from, to] along the line
  indents.forEach((indent, row) => {
    const v = SCREEN_H - 0.3 - row * 0.165;
    const x0 = -1.85 + indent;
    for (let d = 0; d <= lengths[row]; d += 0.045) {
      const f = findings[row];
      const hit = f && d >= f[0] && d <= f[1];
      const color = hit ? c.red : d < 0.35 ? c.soft : c.grey;
      add(onScreen(x0 + d, v, 0.05), color, hit ? 1.25 : 0.95, v, hit ? 1 : 0);
    }
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aScale", new THREE.Float32BufferAttribute(scl, 1));
  g.setAttribute("aV", new THREE.Float32BufferAttribute(vArr, 1));
  g.setAttribute("aThreat", new THREE.Float32BufferAttribute(threat, 1));
  return g;
};

const scanShader = {
  vertexHead: /* glsl */ `
    attribute float aV;
    attribute float aThreat;
    uniform float uScan;
    uniform float uTime;
    uniform vec3 uAccent;
  `,
  vertexBody: /* glsl */ `
    if (aV > -5.0) {
      float band = exp(-pow((aV - uScan) * 7.0, 2.0));
      scale *= 1.0 + band * 1.1;
      col = mix(col, uAccent, band * 0.8);
      float cleared = step(uScan, aV);
      col = mix(col, uAccent, aThreat * cleared);
      scale *= 1.0 + aThreat * (1.0 - cleared) * 0.35 * (0.5 + 0.5 * sin(uTime * 7.0));
    }
  `,
};

// Dotted cube: 12 edges, the offline package.
const buildCube = () => {
  const pos = [];
  const col = [];
  const scl = [];
  const s = 0.45;
  const accent = new THREE.Color(PALETTE.accent);
  const ink = new THREE.Color(PALETTE.ink);
  const corners = [-s, s];
  const push = (p, color, k) => {
    pos.push(...p);
    col.push(color.r, color.g, color.b);
    scl.push(k);
  };
  for (let t = -s; t <= s + 1e-6; t += 0.06) {
    corners.forEach((a) =>
      corners.forEach((b) => {
        push([t, a, b], accent, 1.1);
        push([a, t, b], accent, 1.1);
        push([a, b, t], accent, 1.1);
      })
    );
  }
  // Sparse inner core.
  for (let i = 0; i < 140; i++) push([(Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s], ink, 0.8);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aScale", new THREE.Float32BufferAttribute(scl, 1));
  return g;
};

const CUBE_AT = new THREE.Vector3(2.5, 2.4, 0.2);
const SCREEN_CENTER = new THREE.Vector3(...onScreen(0.2, SCREEN_H * 0.55, 0.05));
const STREAM = 160;

// Points riding a quadratic Bézier from the package into the screen.
const streamShader = {
  vertexHead: /* glsl */ `
    attribute float aPhase;
    uniform float uTime;
    uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  `,
  vertexBody: /* glsl */ `
    float t = fract(aPhase + uTime * 0.22);
    vec3 p = mix(mix(uA, uB, t), mix(uB, uC, t), t);
    pos = p + position * (1.0 - t);
    scale *= sin(t * 3.14159) * 1.2;
  `,
};

const buildStream = () => {
  const g = new THREE.BufferGeometry();
  const jitter = new Float32Array(STREAM * 3).map(() => (Math.random() - 0.5) * 0.35);
  const phase = new Float32Array(STREAM).map((_, i) => i / STREAM + Math.random() * 0.004);
  const color = new Float32Array(STREAM * 3);
  const a = new THREE.Color(PALETTE.accent);
  for (let i = 0; i < STREAM; i++) color.set([a.r, a.g, a.b], i * 3);
  g.setAttribute("position", new THREE.BufferAttribute(jitter, 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(new Float32Array(STREAM).fill(1), 1));
  return g;
};

// Dashed ellipse on the floor: the air-gap boundary.
const Boundary = () => {
  const color = useTheme() === "dark" ? "#efefeb" : PALETTE.ink;
  const line = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, 3.1, 2.5, 0, Math.PI * 2).getPoints(180);
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, BASE_Y - 0.35, p.y - 0.2)));
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: PALETTE.ink, dashSize: 0.1, gapSize: 0.09, transparent: true, opacity: 0.3 }));
    l.computeLineDistances();
    return l;
  }, []);
  useEffect(() => {
    line.material.color.set(color);
  }, [line, color]);
  return <primitive object={line} />;
};

// Scene half-extents the camera must always frame, whatever the panel shape.
const HALF_W = 3.4;
const HALF_H = 2.9;
const TARGET = new THREE.Vector3(0, 0.35, -0.4);
const VIEW_DIR = new THREE.Vector3(0.6, 2.3, 8.6).normalize();

const useFitCamera = () => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(HALF_H / tan, HALF_W / (tan * (size.width / size.height)));
    camera.position.copy(TARGET).addScaledVector(VIEW_DIR, dist);
    camera.lookAt(TARGET);
  }, [camera, size]);
};

const DevLaptop = () => {
  const group = useRef();
  const cube = useRef();
  const size = useThree((s) => s.size);
  useFitCamera();

  const laptopGeo = useMemo(buildLaptop, []);
  const cubeGeo = useMemo(buildCube, []);
  const streamGeo = useMemo(buildStream, []);

  const laptopMat = useMemo(
    () =>
      createDotMaterial({
        size: 0.05,
        extraUniforms: { uScan: { value: 4 }, uTime: { value: 0 }, uAccent: { value: new THREE.Color(PALETTE.accent) } },
        ...scanShader,
      }),
    []
  );
  const cubeMat = useMemo(() => createDotMaterial({ size: 0.055 }), []);
  const streamMat = useMemo(() => {
    const mid = CUBE_AT.clone().lerp(SCREEN_CENTER, 0.5).add(new THREE.Vector3(0, 1.4, 0.6));
    return createDotMaterial({
      size: 0.06,
      extraUniforms: {
        uTime: { value: 0 },
        uA: { value: CUBE_AT.clone() },
        uB: { value: mid },
        uC: { value: SCREEN_CENTER.clone() },
      },
      ...streamShader,
    });
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    [laptopMat, cubeMat, streamMat].forEach((m) => syncViewport(m, size));
    laptopMat.uniforms.uTime.value = t;
    streamMat.uniforms.uTime.value = t;
    // Scan top → bottom over 3.5 s, then hold the "clean" state for 2.5 s.
    const cycle = (t % 6) / 3.5;
    laptopMat.uniforms.uScan.value = cycle <= 1 ? SCREEN_H + 0.2 - cycle * (SCREEN_H + 0.4) : -0.5;

    cube.current.rotation.y = t * 0.5;
    cube.current.rotation.x = Math.sin(t * 0.6) * 0.3;
    cube.current.position.y = CUBE_AT.y + Math.sin(t * 1.2) * 0.08;

    const k = 1 - Math.exp(-delta * 2.5);
    group.current.rotation.y += (-0.35 + Math.sin(t * 0.2) * 0.12 + pointer.x * 0.3 - group.current.rotation.y) * k;
    group.current.rotation.x += (-pointer.y * 0.12 - group.current.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <points geometry={laptopGeo} material={laptopMat} frustumCulled={false} />
      <points geometry={streamGeo} material={streamMat} frustumCulled={false} />
      <group ref={cube} position={CUBE_AT}>
        <points geometry={cubeGeo} material={cubeMat} />
      </group>
      <Boundary />
    </group>
  );
};

export default DevLaptop;
