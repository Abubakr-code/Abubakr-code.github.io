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
  { key: "n2", value: "253,924" },
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
  { name: "Three.js", ext: ".js · .mjs", modelPath: "/models/three.js-transformed.glb", scale: 0.06, rotation: [0, 0, 0], tint: "#0d0d0f" },
  { name: "Git Core", ext: "hooks · diff", modelPath: "/models/git-svg-transformed.glb", scale: 0.06, rotation: [0, -Math.PI / 4, 0] },
  { name: "Docker", ext: "Dockerfile · compose", svgPath: "/models/svg/docker.svg", color: "#2496ED" },
  { name: "Linux Core", ext: "chmod · .sh", svgPath: "/models/svg/linux.svg", color: "#FCC624" },
  { name: "AWS", ext: "Terraform · .tf", svgPath: "/models/svg/aws.svg", color: "#FF9900" },
  { name: "Kubernetes", ext: "YAML · manifests", svgPath: "/models/svg/kubernetes.svg", color: "#326CE5" },
  { name: "PostgreSQL", ext: "SQLi · DB URLs", svgPath: "/models/svg/postgresql.svg", color: "#4d7fe6" },
];

// 06 — inside the engine. Terminal lines: [className, text].
export const expCards = [
  {
    titleKey: "exp.ast.title",
    descKey: "exp.ast.desc",
    host: "armorix scan · OWASP NodeGoat",
    lines: [
      ["text-accent-2", "$ armorix scan ./NodeGoat"],
      ["text-white/45", "files   57 (JS/TS 23) · 5,171 lines · 43 rules"],
      ["text-threat", "CRITICAL  CWE-95   Code injection via eval   contributions.js:32"],
      ["text-threat", "CRITICAL  CWE-943  NoSQL injection          allocations-dao.js:78"],
      ["text-signal", "HIGH      CWE-918  SSRF                     research.js:16"],
      ["text-mint", "11 issue(s) · scanned in 286 ms"],
    ],
    responsibilitiesKeys: ["exp.ast.resp1", "exp.ast.resp2", "exp.ast.resp3"],
  },
  {
    titleKey: "exp.zeroNet.title",
    descKey: "exp.zeroNet.desc",
    host: "armorix · network: off",
    lines: [
      ["text-accent-2", "$ armorix scan ./NodeGoat"],
      ["text-white/45", "ARMORIX v0.3.17 · local static analysis · network: off"],
      ["text-white/85", "$ armorix db update --from /media/usb"],
      ["text-white/45", "# offline CVE database import, no internet needed"],
      ["text-mint", "11 issue(s) · scanned in 286 ms · 0 bytes sent over the network"],
    ],
    responsibilitiesKeys: ["exp.zeroNet.resp1", "exp.zeroNet.resp2", "exp.zeroNet.resp3"],
  },
  {
    titleKey: "exp.crypto.title",
    descKey: "exp.crypto.desc",
    host: "armorix · reports",
    lines: [
      ["text-accent-2", "$ armorix scan ./NodeGoat --format sarif -o report.sarif"],
      ["text-white/85", "SARIF report → report.sarif  (11 findings)"],
      ["text-accent-2", "$ armorix scan . --format markdown   # pull request comment"],
      ["text-white/45", "formats: text · json · sarif · html · markdown · github"],
      ["text-mint", "exit code 1 when a HIGH finding exists (--fail-on)"],
    ],
    responsibilitiesKeys: ["exp.crypto.resp1", "exp.crypto.resp2", "exp.crypto.resp3"],
  },
  {
    titleKey: "exp.proof.title",
    descKey: "exp.proof.desc",
    host: "armorix · taint trace",
    lines: [
      ["text-accent-2", "$ armorix scan ./NodeGoat"],
      ["text-threat", "CRITICAL  CWE-943  NoSQL injection  allocations-dao.js:78"],
      ["text-white/45", "untrusted input `req.query` (allocations.js:23)"],
      ["text-white/85", "source   57 │ getByUserIdAndThreshold = (userId, threshold, cb) =>"],
      ["text-signal", "sink     78 │ $where: `this.userId == ${parsedUserId} && …`"],
      ["text-mint", "fix  cast every field to the expected type"],
    ],
    responsibilitiesKeys: ["exp.proof.resp1", "exp.proof.resp2", "exp.proof.resp3"],
  },
];
