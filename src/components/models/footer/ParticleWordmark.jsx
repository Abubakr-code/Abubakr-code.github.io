import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import SceneCanvas from "../../three/SceneCanvas";
import { PALETTE, createDotMaterial, syncViewport } from "../../three/materials";

// "ARMORIX" in glowing dots on the dark footer — same language as the hero
// shield: points assemble from a cloud, a scan band sweeps left → right and
// red "threat" dots turn blue once it has passed. The cursor pushes dots away.

const TEXT = "ARMORIX";
const WORLD_W = 12;
const FOV = 30;

const sampleText = (step) => {
  const W = 1200;
  const H = 330;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  let size = 250;
  ctx.font = `400 ${size}px Anton, Impact, sans-serif`;
  size *= (W * 0.96) / ctx.measureText(TEXT).width;
  ctx.font = `400 ${Math.min(size, 320)}px Anton, Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(TEXT, W / 2, H / 2 + 6);
  const { data } = ctx.getImageData(0, 0, W, H);

  const pos = [];
  const start = [];
  const col = [];
  const scl = [];
  const delay = [];
  const threat = [];
  const soft = new THREE.Color("#c9d2ff");
  const blue = new THREE.Color(PALETTE.accentBright);
  const red = new THREE.Color(PALETTE.threat);
  const k = WORLD_W / W;

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] < 128) continue;
      const wx = (x - W / 2) * k;
      const wy = -(y - H / 2) * k;
      pos.push(wx, wy, (Math.random() - 0.5) * 0.12);
      // Start scattered on a wide shell behind and around the word.
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 6;
      start.push(Math.cos(a) * r, Math.sin(a) * r * 0.5, -4 - Math.random() * 6);
      const isThreat = Math.random() < 0.02 ? 1 : 0;
      const c = isThreat ? red : Math.random() < 0.3 ? blue : soft;
      col.push(c.r, c.g, c.b);
      scl.push(isThreat ? 1.6 : 0.75 + Math.random() * 0.5);
      delay.push(Math.random());
      threat.push(isThreat);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aStart", new THREE.Float32BufferAttribute(start, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aScale", new THREE.Float32BufferAttribute(scl, 1));
  g.setAttribute("aDelay", new THREE.Float32BufferAttribute(delay, 1));
  g.setAttribute("aThreat", new THREE.Float32BufferAttribute(threat, 1));
  return g;
};

const shader = {
  vertexHead: /* glsl */ `
    attribute vec3 aStart;
    attribute float aDelay;
    attribute float aThreat;
    uniform float uProgress;
    uniform float uTime;
    uniform float uScan;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform vec3 uBlue;
  `,
  vertexBody: /* glsl */ `
    float k = clamp((uProgress - aDelay * 0.45) / 0.55, 0.0, 1.0);
    k = 1.0 - pow(1.0 - k, 3.0);
    pos = mix(aStart, position, k);

    vec2 dm = pos.xy - uMouse;
    float push = smoothstep(1.3, 0.0, length(dm)) * uHover;
    pos.xy += normalize(dm + 1e-4) * push * 0.5;
    pos.z += push * 0.9;

    scale *= 0.85 + 0.25 * sin(uTime * 2.0 + aDelay * 40.0);

    float band = exp(-pow((pos.x - uScan) * 1.5, 2.0));
    scale *= 1.0 + band * 0.9;
    col = mix(col, vec3(1.0), band * 0.55);
    col = mix(col, uBlue, aThreat * step(pos.x, uScan));
    col = mix(col, vec3(1.0), push * 0.6);
    col *= 0.35 + 0.65 * k;
  `,
};

const HALF_W = WORLD_W / 2 + 0.25;
const HALF_H = 1.45;

const Wordmark = () => {
  const group = useRef();
  const hover = useRef(0);
  const { camera, size, gl } = useThree();
  const [geometry, setGeometry] = useState(null);

  // Sample only once Anton is available, otherwise the fallback font is baked in.
  useEffect(() => {
    let live = true;
    const step = window.innerWidth < 768 ? 6 : 4;
    const build = () => live && setGeometry(sampleText(step));
    document.fonts?.load("400 200px Anton").then(build, build) ?? build();
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  useEffect(() => {
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.position.set(0, 0, Math.max(HALF_H / tan, HALF_W / (tan * (size.width / size.height))));
    camera.lookAt(0, 0, 0);
  }, [camera, size]);

  useEffect(() => {
    const el = gl.domElement;
    const on = () => (hover.current = 1);
    const off = () => (hover.current = 0);
    el.addEventListener("pointermove", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointermove", on);
      el.removeEventListener("pointerleave", off);
    };
  }, [gl]);

  const material = useMemo(() => {
    const m = createDotMaterial({
      size: 0.085,
      themed: false, // the footer is dark in both themes
      extraUniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uScan: { value: -10 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uHover: { value: 0 },
        uBlue: { value: new THREE.Color(PALETTE.accentBright) },
      },
      ...shader,
    });
    m.blending = THREE.AdditiveBlending; // glow on the dark footer
    return m;
  }, []);

  useFrame(({ clock, pointer, viewport }, delta) => {
    if (!geometry) return;
    syncViewport(material, size);
    const u = material.uniforms;
    const t = clock.elapsedTime;
    u.uTime.value = t;
    u.uProgress.value = Math.min(1.45, u.uProgress.value + delta * 0.55);
    // Sweep once the word has formed: 3.5 s across, 2.5 s rest.
    const cycle = (t % 6) / 3.5;
    u.uScan.value = u.uProgress.value < 1.2 ? -10 : cycle <= 1 ? -HALF_W - 1 + cycle * (2 * HALF_W + 2) : 10;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    u.uMouse.value.set((pointer.x * vp.width) / 2, (pointer.y * vp.height) / 2);
    u.uHover.value += (hover.current - u.uHover.value) * (1 - Math.exp(-delta * 6));
    const k = 1 - Math.exp(-delta * 2);
    group.current.rotation.y += (pointer.x * 0.12 * hover.current + Math.sin(t * 0.3) * 0.05 - group.current.rotation.y) * k;
    group.current.rotation.x += (-pointer.y * 0.1 * hover.current - group.current.rotation.x) * k;
  });

  return <group ref={group}>{geometry && <points geometry={geometry} material={material} frustumCulled={false} />}</group>;
};

const ParticleWordmark = ({ className = "" }) => (
  <SceneCanvas className={className} camera={{ fov: FOV, position: [0, 0, 20] }}>
    <Wordmark />
  </SceneCanvas>
);

export default ParticleWordmark;
