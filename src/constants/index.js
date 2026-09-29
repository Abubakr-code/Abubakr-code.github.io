import { Code2, Cpu, FileCode2, GitPullRequest, KeyRound, Laptop, Settings2 } from "lucide-react";

// ── Downloads ──────────────────────────────────────────────
// The GitHub repository that holds the desktop app (armorix-engine). Set VITE_GITHUB_REPO
// in the hosting dashboard (e.g. "yourname/armorix") or edit the fallback below.
export const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || "Abubakr-code/armorix";
export const REPO_URL = `https://github.com/${GITHUB_REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases/latest/download`;

export const navLinks = [
  { key: "nav.about", href: "#about" },
  { key: "nav.devs", href: "#devs" },
  { key: "nav.steps", href: "#steps" },
  { key: "nav.why", href: "#why" },
  { key: "nav.lab", href: "#lab" },
];

// Hero ticker — 4 scan targets, duplicated so the 8-step CSS slider loops seamlessly.
const scanTargets = [
  { key: "memory", Icon: Cpu },
  { key: "secrets", Icon: KeyRound },
  { key: "configs", Icon: Settings2 },
  { key: "code", Icon: FileCode2 },
];
export const words = [...scanTargets, ...scanTargets];

// Tools Armorix plugs into (hero strip). Monochrome marks from simple-icons (CC0).
export const integrations = ["github", "gitlab", "jenkins", "githubactions", "docker", "kubernetes", "jetbrains", "neovim", "gitea", "bitbucket"];

// 01 — what Armorix is
export const aboutCards = ["c1", "c2", "c3", "c4"];

// 02 — who it's for
export const devPersonas = [
  { key: "p1", Icon: Code2 },
  { key: "p2", Icon: Laptop },
  { key: "p3", Icon: GitPullRequest },
];

// 03 — pinned stats; values are language-neutral
export const numbers = [
  { key: "n1", value: "0 B" },
  { key: "n2", value: "15,482" },
  { key: "n3", value: "1M+" },
  { key: "n4", value: "100%" },
];

// 04 — horizontal steps
export const steps = ["s1", "s2", "s3", "s4", "s5"];

// 05 — why Armorix
export const whyItems = ["w1", "w2", "w3", "w4", "w5", "w6"];

// `ext` lists what Armorix parses for each ecosystem.
export const techStackIcons = [
  { name: "React", ext: ".jsx · .tsx", modelPath: "/models/react_logo-transformed.glb", scale: 1.2, rotation: [0, 0, 0] },
  { name: "Python", ext: ".py · pip", modelPath: "/models/python-transformed.glb", scale: 0.95, rotation: [0, 0, 0] },
  { name: "Node.js", ext: ".js · npm", modelPath: "/models/node-transformed.glb", scale: 6, rotation: [0, -Math.PI / 2, 0] },
  { name: "Three.js", ext: "GLSL · .mjs", modelPath: "/models/three.js-transformed.glb", scale: 0.06, rotation: [0, 0, 0], tint: "#0d0d0f" },
  { name: "Git Core", ext: "hooks · diff", modelPath: "/models/git-svg-transformed.glb", scale: 0.06, rotation: [0, -Math.PI / 4, 0] },
  { name: "Docker", ext: "Dockerfile · OCI", svgPath: "/models/svg/docker.svg", color: "#2496ED" },
  { name: "Linux Core", ext: "ELF · sysctl", svgPath: "/models/svg/linux.svg", color: "#FCC624" },
  { name: "AWS", ext: "IaC · IAM", svgPath: "/models/svg/aws.svg", color: "#FF9900" },
  { name: "Kubernetes", ext: "YAML · Helm", svgPath: "/models/svg/kubernetes.svg", color: "#326CE5" },
  { name: "PostgreSQL", ext: "SQL · PL/pgSQL", svgPath: "/models/svg/postgresql.svg", color: "#4d7fe6" },
];

// 06 — inside the engine. Terminal lines: [className, text].
export const expCards = [
  {
    titleKey: "exp.ast.title",
    descKey: "exp.ast.desc",
    host: "armorix-core · ast",
    lines: [
      ["text-accent-2", "$ armorix-core --analyze /var/www/app"],
      ["text-white/45", "[i] Initializing AST parser..."],
      ["text-white/85", "[+] Parsed 14,230 LOC in 0.8s"],
      ["text-signal", "[!] Warning: Potential ReDoS in regex.js:42"],
      ["text-threat", "[x] CRITICAL: Hardcoded JWT secret in auth.ts:12"],
      ["text-mint", "Analysis complete. 2 issues found."],
    ],
    responsibilitiesKeys: ["exp.ast.resp1", "exp.ast.resp2", "exp.ast.resp3"],
  },
  {
    titleKey: "exp.zeroNet.title",
    descKey: "exp.zeroNet.desc",
    host: "net-monitor · air-gap",
    lines: [
      ["text-accent-2", "$ armorix-net-monitor --status"],
      ["text-white/45", "Verifying network isolation rules..."],
      ["text-white/85", "[ OK ] Telemetry modules disabled"],
      ["text-white/85", "[ OK ] External API calls blocked"],
      ["text-mint", "[ OK ] Air-gapped mode: ACTIVE"],
      ["text-white/45", "System is self-contained. 0 bytes leaked."],
    ],
    responsibilitiesKeys: ["exp.zeroNet.resp1", "exp.zeroNet.resp2", "exp.zeroNet.resp3"],
  },
  {
    titleKey: "exp.crypto.title",
    descKey: "exp.crypto.desc",
    host: "report · ecdsa",
    lines: [
      ["text-accent-2", "$ armorix-report --export pdf --sign"],
      ["text-white/45", "Compiling vulnerability data..."],
      ["text-white/85", "Generated report: audit_20260924.pdf"],
      ["text-white/45", "Applying ECDSA signature..."],
      ["text-signal", "Hash: 8f4e2a...c9d1b"],
      ["text-mint", "[+] Report signed successfully."],
    ],
    responsibilitiesKeys: ["exp.crypto.resp1", "exp.crypto.resp2", "exp.crypto.resp3"],
  },
];
