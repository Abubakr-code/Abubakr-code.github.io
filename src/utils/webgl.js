// Whether this browser can create a WebGL context at all. Checked once: with hardware
// acceleration off (GL_VENDOR = Disabled) every three.js Canvas would throw instead of drawing.
let cached;

export const hasWebGL = () => {
  if (cached !== undefined) return cached;
  // `?nowebgl` forces the fallback, to check how the page looks on a machine without a GPU.
  if (new URLSearchParams(window.location.search).has("nowebgl")) return (cached = false);
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cached = Boolean(gl);
    // Hand the probe context back so it does not count against the browser's ~16 context limit.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
};
