import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

import useInView from "../../hooks/useInView";

// Canvas wrapper that stops its render loop while offscreen,
// so only the scenes the visitor can actually see use the GPU.
const SceneCanvas = ({ children, className = "", dpr = [1, 1.5], gl, ...props }) => {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className={className}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false, ...gl }}
        {...props}
      >
        {children}
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
