import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import SceneCanvas from "./SceneCanvas";
import { createDotMaterial, syncViewport } from "./materials";
import { MORPH_PALETTE } from "./shapes";

// One point cloud that morphs between up to 6 shapes on the GPU.
// `stage` (ref, float) picks the shape; `progress` (ref, 0..1, optional) is the
// section's scroll progress and swings the cloud — the scroll-driven camera.
// Each shape is packed as vec4(x, y, z, paletteIndex) so 6 shapes fit in 6 attributes.

const buildGeometry = (shapes, count) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  shapes.forEach((shape, s) => {
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) data.set(shape(i, count), i * 4);
    g.setAttribute(`aP${s}`, new THREE.BufferAttribute(data, 4));
  });
  g.setAttribute("aDelay", new THREE.BufferAttribute(new Float32Array(count).map(() => Math.random()), 1));
  g.setAttribute("aScale", new THREE.BufferAttribute(new Float32Array(count).map(() => 0.75 + Math.random() * 0.6), 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return g;
};

const buildShader = (n) => {
  const attrs = Array.from({ length: n }, (_, s) => `attribute vec4 aP${s};`).join("\n");
  const chain = Array.from({ length: n - 1 }, (_, s) => `i < ${s}.5 ? aP${s} : `).join("") + `aP${n - 1}`;
  return {
    vertexHead: /* glsl */ `
      ${attrs}
      attribute float aDelay;
      uniform float uStage;
      uniform float uTime;
      uniform vec3 uPal[6];
      vec4 pickShape(float i) { return ${chain}; }
      float isThreat(float c) { return 1.0 - step(0.5, abs(c - 4.0)); }
    `,
    vertexBody: /* glsl */ `
      float last = ${n - 1}.0;
      float s = clamp(uStage, 0.0, last);
      float i0 = floor(s);
      float k = smoothstep(0.0, 1.0, clamp((s - i0) * 1.6 - aDelay * 0.6, 0.0, 1.0));
      vec4 a = pickShape(i0);
      vec4 b = pickShape(min(i0 + 1.0, last));
      pos = mix(a.xyz, b.xyz, k);
      pos += 0.025 * vec3(sin(uTime + aDelay * 30.0), cos(uTime * 0.8 + aDelay * 20.0), sin(uTime * 0.6 + aDelay * 11.0));
      col = mix(uPal[int(a.w + 0.5)], uPal[int(b.w + 0.5)], k);
      scale *= 1.0 + 0.6 * mix(isThreat(a.w), isThreat(b.w), k);
    `,
  };
};

// Phones get ~60% of the points: same shapes, lighter GPU and memory load.
const SMALL_SCREEN = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

const Morph = ({ shapes, count: requested, stage, progress, size, spin }) => {
  const count = SMALL_SCREEN ? Math.round(requested * 0.6) : requested;
  const group = useRef();
  const view = useThree((s) => s.size);
  const geometry = useMemo(() => buildGeometry(shapes, count), [shapes, count]);
  const material = useMemo(
    () =>
      createDotMaterial({
        size,
        extraUniforms: {
          uStage: { value: 0 },
          uTime: { value: 0 },
          uPal: { value: MORPH_PALETTE.map((c) => new THREE.Color(c)) },
        },
        ...buildShader(shapes.length),
      }),
    [shapes.length, size]
  );

  useFrame(({ clock, pointer }, delta) => {
    syncViewport(material, view);
    const u = material.uniforms;
    const t = clock.elapsedTime;
    u.uTime.value = t;
    u.uStage.value += ((stage?.current ?? 0) - u.uStage.value) * (1 - Math.exp(-delta * 3));
    const p = progress?.current ?? 0;
    const k = 1 - Math.exp(-delta * 2.5);
    // Scroll swings the cloud ±spin/2 rad — a camera move that never turns flat shapes edge-on.
    const targetY = Math.sin(t * 0.25) * 0.3 + (p - 0.5) * spin + pointer.x * 0.25;
    const targetX = 0.15 + Math.sin(t * 0.3) * 0.08 - pointer.y * 0.15 + (p - 0.5) * 0.3;
    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.x += (targetX - group.current.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

const MorphScene = ({ shapes, stage, progress, count = 2400, size = 0.05, spin = 1.0, className = "", distance = 9 }) => (
  <SceneCanvas className={className} camera={{ position: [0, 0, distance], fov: 40 }}>
    <Morph shapes={shapes} count={count} stage={stage} progress={progress} size={size} spin={spin} />
  </SceneCanvas>
);

export default MorphScene;
