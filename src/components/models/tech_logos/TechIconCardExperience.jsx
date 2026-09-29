import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF, View } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";

import useInView from "../../../hooks/useInView";
import { useTheme } from "../../../theme";

// Resting pose: turned enough that the extrusion depth reads as 3D.
const REST_Y = -0.45;

// Procedural studio environment — no HDR download, works fully offline.
let envTexture;
const useStudioEnvironment = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (!envTexture) {
      const pmrem = new THREE.PMREMGenerator(gl);
      envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    }
    scene.environment = envTexture;
  }, [gl, scene]);
};

const GltfLogo = ({ model }) => {
  const { scene } = useGLTF(model.modelPath);
  const invalidate = useThree((s) => s.invalidate);
  const dark = useTheme() === "dark";

  useEffect(() => {
    // The three.js mark ships white; on light tiles it is re-tinted to ink.
    if (!model.tint) return;
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_5") {
        child.material = new THREE.MeshStandardMaterial({ color: dark ? "#efefeb" : model.tint, roughness: 0.4 });
      }
    });
    invalidate();
  }, [scene, model.tint, dark, invalidate]);

  return (
    <group scale={model.scale} rotation={model.rotation}>
      <primitive object={scene} />
    </group>
  );
};

// Single-path brand SVG → beveled, extruded solid.
const ExtrudedLogo = ({ model }) => {
  const data = useLoader(SVGLoader, model.svgPath);

  const geometry = useMemo(() => {
    const shapes = data.paths.flatMap((path) => SVGLoader.createShapes(path));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 2.6,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.12,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geo.center();
    geo.computeBoundingBox();
    const size = new THREE.Vector3();
    geo.boundingBox.getSize(size);
    const k = 4.2 / Math.max(size.x, size.y);
    geo.scale(k, k, k);
    return geo;
  }, [data]);

  // Rotating π around X flips SVG's y-down space without mirroring the faces.
  return (
    <mesh geometry={geometry} rotation={[Math.PI, 0, 0]}>
      <meshStandardMaterial color={model.color} metalness={0.5} roughness={0.28} envMapIntensity={1.1} />
    </mesh>
  );
};

// Spins while its card is hovered, eases back to the resting pose otherwise.
// Only requests frames while moving, so idle cards cost nothing.
const Spinner = ({ hovered, children }) => {
  const ref = useRef();
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, delta) => {
    const g = ref.current;
    if (hovered.current) {
      g.rotation.y += delta * 2.4;
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0.25, 1 - Math.exp(-delta * 8));
      invalidate();
      return;
    }
    // Settle on the nearest full turn so the logo never spins backwards.
    const target = REST_Y + Math.round((g.rotation.y - REST_Y) / (Math.PI * 2)) * Math.PI * 2;
    const k = 1 - Math.exp(-delta * 5);
    g.rotation.y += (target - g.rotation.y) * k;
    g.position.y += (0 - g.position.y) * k;
    if (Math.abs(target - g.rotation.y) > 0.002 || Math.abs(g.position.y) > 0.002) invalidate();
  });

  return (
    <group ref={ref} rotation={[0.08, REST_Y, 0]}>
      {children}
    </group>
  );
};

const LogoScene = ({ model, hovered }) => {
  useStudioEnvironment();
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-4, -2, 3]} intensity={10} color="#ffffff" />
      <Suspense fallback={null}>
        <Spinner hovered={hovered}>
          {model.svgPath ? <ExtrudedLogo model={model} /> : <GltfLogo model={model} />}
        </Spinner>
      </Suspense>
    </>
  );
};

// DOM slot for one logo. Rendering happens in the shared <TechViewCanvas />.
export const TechIconView = ({ model, hovered, className = "" }) => (
  <View className={className}>
    <LogoScene model={model} hovered={hovered} />
  </View>
);

// Views re-read their DOM rects every frame; in demand mode that only happens
// when something asks for a frame, so scrolling and resizing must ask.
const ScrollInvalidator = () => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const kick = () => invalidate();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("pointermove", kick, { passive: true });
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("pointermove", kick);
    };
  }, [invalidate]);
  return null;
};

// One fixed, transparent WebGL context that draws every <TechIconView /> via scissor.
// Hidden and paused whenever the tech section is off screen.
export const TechViewCanvas = ({ sectionRef }) => {
  const inView = useInView(sectionRef, "100px");

  return (
    <Canvas
      frameloop={inView ? "demand" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, stencil: false }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 40,
        pointerEvents: "none",
        visibility: inView ? "visible" : "hidden",
      }}
    >
      <ScrollInvalidator />
      <View.Port />
    </Canvas>
  );
};

[
  "/models/react_logo-transformed.glb",
  "/models/python-transformed.glb",
  "/models/node-transformed.glb",
  "/models/three.js-transformed.glb",
  "/models/git-svg-transformed.glb",
].forEach((p) => useGLTF.preload(p));
