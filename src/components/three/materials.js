import * as THREE from "three";

import { darkUniform } from "../../theme";

// Armorix palette for WebGL. Mirrors the @theme tokens in index.css.
export const PALETTE = {
  paper: "#f4f4f1",
  ink: "#0d0d0f",
  accent: "#2448ff",
  accentSoft: "#9eadff",
  accentBright: "#7088ff",
  grey: "#b8b8b0",
  threat: "#ff3b5c",
  signal: "#ffb020",
  mint: "#19d58a",
};

// Round, anti-aliased dots with per-point colour and scale. Normal blending,
// so it reads correctly on the light paper background (additive would vanish).
// In night mode neutral colours invert (ink → near-white, light grey → dim grey)
// and saturated ones brighten; `themed: false` opts out (scenes on a dark surface).
export const createDotMaterial = ({ size = 0.05, extraUniforms = {}, vertexHead = "", vertexBody = "", themed = true } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSize: { value: size },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
      uViewport: { value: 800 },
      uDark: themed ? darkUniform : { value: 0 },
      ...extraUniforms,
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aScale;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform float uViewport;
      varying vec3 vColor;
      ${vertexHead}
      void main() {
        vec3 pos = position;
        vec3 col = aColor;
        float scale = aScale;
        ${vertexBody}
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * scale * uPixelRatio * uViewport / -mv.z;
        vColor = col;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uDark;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        vec3 c = vColor;
        float sat = max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
        vec3 night = sat < 0.15 ? vec3(1.0) - c * 0.94 : mix(c, vec3(1.0), 0.2);
        gl_FragColor = vec4(mix(c, night, uDark), smoothstep(0.5, 0.32, d));
      }
    `,
  });

// Keeps the dot size proportional to the canvas height, like world-space sizing.
export const syncViewport = (material, size) => {
  material.uniforms.uViewport.value = size.height;
};
