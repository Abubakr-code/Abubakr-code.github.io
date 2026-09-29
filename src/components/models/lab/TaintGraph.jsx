import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import SceneCanvas from "../../three/SceneCanvas";
import { PALETTE } from "../../three/materials";

const SCAN_SECONDS = 1.6;
const X_GAP = 1.75;
const Y_GAP = 1.3;

const C = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const COLORS = {
  idle: C(PALETTE.accentBright, 0.35),
  lit: C(PALETTE.accentBright, 1.4),
  flash: C("#ffffff", 3),
  source: C(PALETTE.signal, 2.2),
  sink: C(PALETTE.threat, 2.6),
  taint: C(PALETTE.threat, 1.6),
  safe: C(PALETTE.mint, 2.2),
};

// Tidy tree: leaves get sequential x slots, parents sit above their children's centre.
const layoutTree = (nodes) => {
  const children = Object.fromEntries(nodes.map((n) => [n.id, []]));
  nodes.forEach((n) => n.parent && children[n.parent].push(n.id));
  const root = nodes.find((n) => !n.parent).id;
  const pos = {};
  let slot = 0;
  let maxDepth = 0;
  const walk = (id, depth, sibling) => {
    maxDepth = Math.max(maxDepth, depth);
    const kids = children[id];
    kids.forEach((k, i) => walk(k, depth + 1, i));
    const x = kids.length ? kids.reduce((sum, k) => sum + pos[k].x, 0) / kids.length : slot++ * X_GAP;
    pos[id] = new THREE.Vector3(x, -depth * Y_GAP, depth === 0 ? 0 : (sibling % 2 ? 0.55 : -0.55));
  };
  walk(root, 0, 0);
  const cx = ((slot - 1) * X_GAP) / 2;
  const cy = (maxDepth * Y_GAP) / 2;
  Object.values(pos).forEach((p) => p.set(p.x - cx, p.y + cy, p.z));
  return { pos, root };
};

// Data-flow overlay floats slightly in front of the AST so it never hides behind nodes.
const lift = (p) => p.clone().add(new THREE.Vector3(0, 0, 0.35));

const GraphNode = ({ node, position, ctx, inTaint }) => {
  const mesh = useRef();
  const halo = useRef();
  const color = useMemo(() => COLORS.idle.clone(), []);
  const target = useMemo(() => new THREE.Color(), []);
  const isKey = node.role === "source" || node.role === "sink";

  useFrame(({ clock }, delta) => {
    const { phase, t0, rootPos } = ctx.current;
    const t = clock.elapsedTime;
    const since = t - t0;
    let flash = 0;

    if (phase === "idle") target.copy(COLORS.idle);
    else {
      const reached = phase !== "scanning" || (since / SCAN_SECONDS) * 7 > position.distanceTo(rootPos);
      if (!reached) target.copy(COLORS.idle);
      else if (phase === "scanning") {
        target.copy(COLORS.lit);
        flash = Math.max(0, 1 - ((since / SCAN_SECONDS) * 7 - position.distanceTo(rootPos)) * 1.5);
      } else if (phase === "found") {
        target.copy(node.role === "source" ? COLORS.source : node.role === "sink" ? COLORS.sink : inTaint ? COLORS.taint : COLORS.lit);
      } else {
        target.copy(inTaint || isKey ? COLORS.safe : COLORS.lit);
      }
    }
    if (flash > 0) target.lerp(COLORS.flash, flash);
    color.lerp(target, 1 - Math.exp(-delta * 8));
    mesh.current.material.color.copy(color);

    const alarm = phase === "found" && node.role === "sink";
    mesh.current.scale.setScalar((isKey ? 1.35 : 1) * (alarm ? 1 + Math.sin(t * 8) * 0.18 : 1));
    if (halo.current) {
      halo.current.rotation.z += delta * (alarm ? 3 : 0.8);
      halo.current.material.color.copy(color);
      halo.current.material.opacity = phase === "idle" ? 0.15 : 0.8;
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh}>
        {node.role === "sink" ? <octahedronGeometry args={[0.2, 0]} /> : <sphereGeometry args={[0.14, 20, 20]} />}
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      {isKey && (
        <mesh ref={halo}>
          <torusGeometry args={[0.36, 0.012, 6, 48, Math.PI * 1.6]} />
          <meshBasicMaterial transparent toneMapped={false} />
        </mesh>
      )}
      <Html center position={[0, -0.42, 0]} distanceFactor={8} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div className={`ast-label ${node.role ? `ast-label--${node.role}` : ""} ${inTaint ? "ast-label--taint" : ""}`}>
          {node.label}
        </div>
      </Html>
    </group>
  );
};

const Sanitizer = ({ position, label, visible }) => {
  const ref = useRef();
  useFrame(({ clock }, delta) => {
    const k = 1 - Math.exp(-delta * 6);
    const s = ref.current.scale.x + ((visible ? 1 : 0.001) - ref.current.scale.x) * k;
    ref.current.scale.setScalar(s);
    ref.current.rotation.y = clock.elapsedTime * 1.5;
  });
  return (
    <group position={position}>
      <group ref={ref} scale={0.001}>
        <mesh>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshBasicMaterial color={COLORS.safe} toneMapped={false} wireframe />
        </mesh>
        <mesh>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshBasicMaterial color={COLORS.safe} toneMapped={false} />
        </mesh>
      </group>
      {visible && (
        <Html position={[0.32, 0.1, 0]} distanceFactor={8} zIndexRange={[10, 0]} style={{ pointerEvents: "none", transform: "translateY(-50%)" }}>
          <div className="ast-label ast-label--sanitizer">{label}</div>
        </Html>
      )}
    </group>
  );
};

const FlowLine = ({ points, color, active }) => {
  const line = useRef();
  const pulse = useRef();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "centripetal"), [points]);
  const samples = useMemo(() => curve.getPoints(80), [curve]);

  useFrame(({ clock }, delta) => {
    if (!line.current) return;
    line.current.material.dashOffset -= delta * 1.8;
    pulse.current.position.copy(curve.getPointAt((clock.elapsedTime * 0.45) % 1));
  });

  if (!active) return null;
  return (
    <group>
      <Line ref={line} points={samples} color={color} lineWidth={3} dashed dashSize={0.22} gapSize={0.12} toneMapped={false} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

const ScanWave = ({ ctx }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const { phase, t0, rootPos } = ctx.current;
    const k = (clock.elapsedTime - t0) / SCAN_SECONDS;
    const on = phase === "scanning" && k < 1;
    ref.current.visible = on;
    if (!on) return;
    ref.current.position.copy(rootPos);
    ref.current.scale.setScalar(0.1 + k * 7);
    ref.current.material.opacity = (1 - k) * 0.35;
  });
  return (
    <mesh ref={ref} visible={false}>
      <icosahedronGeometry args={[1, 3]} />
      <meshBasicMaterial color={COLORS.lit} wireframe transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

const Graph = ({ sample, phase, phaseStartedAt }) => {
  const group = useRef();
  const { pos, root } = useMemo(() => layoutTree(sample.nodes), [sample]);
  const ctx = useRef({ phase, t0: 0, rootPos: pos[root] });
  const lastPhase = useRef(null);

  // Sync React phase into the render loop and stamp the clock when it changes.
  useFrame(({ clock }) => {
    if (lastPhase.current !== phaseStartedAt) {
      lastPhase.current = phaseStartedAt;
      ctx.current.t0 = clock.elapsedTime;
    }
    ctx.current.phase = phase;
    ctx.current.rootPos = pos[root];
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.3;
  });

  const taintSet = useMemo(() => new Set(sample.taint), [sample]);
  const taintPoints = useMemo(() => sample.taint.map((id) => lift(pos[id])), [sample, pos]);

  const sink = pos[sample.taint[sample.taint.length - 1]];
  const beforeSink = pos[sample.taint[sample.taint.length - 2]];
  const sanitizerPos = useMemo(
    () => beforeSink.clone().lerp(sink, 0.5).add(new THREE.Vector3(1.1, 0.1, 0.9)),
    [beforeSink, sink]
  );
  const patchedPoints = useMemo(
    () => [...taintPoints.slice(0, -1), sanitizerPos, taintPoints[taintPoints.length - 1]],
    [taintPoints, sanitizerPos]
  );

  const edges = sample.nodes.filter((n) => n.parent).map((n) => [pos[n.parent], pos[n.id]]);

  return (
    <group ref={group}>
      {edges.map(([a, b], i) => (
        <Line key={i} points={[a, b]} color={PALETTE.accentBright} lineWidth={1} transparent opacity={phase === "idle" ? 0.15 : 0.35} />
      ))}
      {sample.nodes.map((node) => (
        <GraphNode key={node.id} node={node} position={pos[node.id]} ctx={ctx} inTaint={taintSet.has(node.id)} />
      ))}
      <FlowLine points={taintPoints} color={COLORS.sink} active={phase === "found"} />
      <FlowLine points={patchedPoints} color={COLORS.safe} active={phase === "patched"} />
      <Sanitizer position={sanitizerPos} label={sample.sanitizer} visible={phase === "patched"} />
      <ScanWave ctx={ctx} />
    </group>
  );
};

const TaintGraph = ({ sample, phase, phaseStartedAt }) => (
  <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.4, 8.6], fov: 45 }}>
    <Graph key={sample.id} sample={sample} phase={phase} phaseStartedAt={phaseStartedAt} />
    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(Math.PI * 2) / 3} />
  </SceneCanvas>
);

export default TaintGraph;
