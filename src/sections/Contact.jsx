import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Apple, Check, Code2, Copy, Cpu, Download, HardDrive, Lock, MemoryStick, ShieldCheck, Terminal } from "lucide-react";

import SectionLabel from "../components/SectionLabel";
import { RELEASES_URL, REPO_URL } from "../constants";
import ContactExperience from "../components/models/contact/ContactExperience";

// Install methods: command + what the terminal prints afterwards ([className, text]).
// Files come from the GitHub Releases built by armorix-engine/.github/workflows/release.yml.
const APPIMAGE = "Armorix-linux-x86_64.AppImage";
const DEB = "Armorix-linux-amd64.deb";
const METHODS = {
  appimage: {
    cmd: `wget ${RELEASES_URL}/${APPIMAGE} && chmod +x ${APPIMAGE} && ./${APPIMAGE}`,
    out: [
      ["text-white/50", `[i] ${APPIMAGE} — desktop app, no install needed`],
      ["text-accent-2", "[✓] Engine, rules and AI runtime bundled"],
      ["text-mint", "[+] Air-gapped mode: ACTIVE (0 external connections)"],
      ["text-white", "→ choose a folder, type: «chuqur tekshir»"],
    ],
  },
  deb: {
    cmd: `wget ${RELEASES_URL}/${DEB} && sudo apt install ./${DEB}`,
    out: [
      ["text-white/50", "Reading package lists... Done"],
      ["text-white/80", "Setting up armorix (0.1.0) ..."],
      ["text-accent-2", "[✓] Menu entry: Development → Armorix"],
      ["text-mint", "[+] Telemetry: none"],
    ],
  },
  cli: {
    cmd: `pip install git+${REPO_URL} && armorix scan . --lang uz`,
    out: [
      ["text-white/50", "[i] 16 AST rules · OSV dependency check · AI fixes"],
      ["text-accent-2", "[✓] armorix db update   — offline CVE database"],
      ["text-accent-2", "[✓] armorix fix . --apply — verified AI patches"],
      ["text-mint", "[✓] armorix hook install — block risky commits"],
    ],
  },
};

const DOWNLOADS = [
  { name: "Linux", Icon: HardDrive, arch: "AppImage · .deb", href: `${RELEASES_URL}/${APPIMAGE}` },
  { name: "macOS", Icon: Apple, arch: "Apple Silicon", href: `${RELEASES_URL}/Armorix-mac-arm64.dmg` },
  { name: "Windows", Icon: Terminal, arch: "Windows 10 / 11 · x64", href: `${RELEASES_URL}/Armorix-win-x64.exe` },
  { name: "VS Code", Icon: Code2, archKey: "deploy.vscode", href: `${RELEASES_URL}/Armorix-vscode.vsix` },
];

const REQUIREMENTS = [
  { Icon: MemoryStick, key: "ram" },
  { Icon: Cpu, key: "cpu" },
  { Icon: ShieldCheck, key: "sha" },
  { Icon: Lock, key: "airgap" },
];

const Contact = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("appimage");
  const [copied, setCopied] = useState(false);
  const method = METHODS[activeTab];

  const handleCopy = () => {
    navigator.clipboard?.writeText(method.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="relative scroll-mt-24 pt-28 pb-28 md:pb-40">
      <div className="container-x">
        <SectionLabel index="09">{t("section.deploy")}</SectionLabel>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="h-section max-w-3xl">{t("deploy.title")}</h2>
          <p className="text-muted md:text-right max-w-sm">{t("deploy.subtitle")}</p>
        </div>

        {/* Install panel and 3D share one height at xl. */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-14 xl:h-[640px]">
          {/* LEFT: install */}
          <div className="xl:col-span-7 card !translate-y-0 p-6 md:p-8 flex flex-col">
            <div className="flex flex-wrap gap-1 p-1 rounded-3xl sm:rounded-full bg-paper w-fit">
              {Object.keys(METHODS).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all ${
                    activeTab === tab ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {t(`deploy.tab.${tab}`)}
                </button>
              ))}
            </div>

            <div className="terminal mt-4 flex-1 min-h-[230px] flex flex-col">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white/20" />
                <span className="ml-3 font-mono text-xs text-white/40 hidden sm:inline">bash — armorix-install</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-white/80 hover:border-white/40 text-xs cursor-pointer transition-colors"
                  title={t("deploy.copy")}
                >
                  {copied ? <Check className="size-3.5 text-mint" /> : <Copy className="size-3.5" />}
                  {copied ? t("deploy.copied") : t("deploy.copy")}
                </button>
              </div>
              <div className="px-5 md:px-6 py-4 font-mono text-[13px] md:text-[14px] leading-[26px]">
                <p className="text-white break-all">
                  <span className="text-accent-2 select-none">$ </span>
                  {method.cmd}
                </p>
                {/* Keyed by tab so the output replays on every switch. */}
                <div key={activeTab} className="mt-1.5">
                  {method.out.map(([cls, line], i) => (
                    <p key={line} className={`${cls} term-line break-all`} style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
                      {line}
                    </p>
                  ))}
                  <span className="term-cursor" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              {DOWNLOADS.map((item) => {
                const { name, Icon, archKey } = item;
                const arch = archKey ? t(archKey) : item.arch;
                return (
                  <a key={name} href={item.href} className="os-card group" rel="noopener">
                    <Icon className="size-5 shrink-0 text-ink/80 group-hover:text-accent" />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold leading-tight">{name}</span>
                      <span className="hidden md:block text-[12px] text-muted truncate">{arch}</span>
                    </span>
                    <Download className="size-4 ml-auto shrink-0 text-muted group-hover:text-accent" />
                  </a>
                );
              })}
            </div>

            <ul className="flex flex-wrap gap-2 mt-4 text-[12px] text-ink/75">
              {REQUIREMENTS.map((item) => {
                const { Icon, key } = item;
                return (
                  <li key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper">
                    <Icon className="size-3.5 text-accent" />
                    {t(`deploy.req.${key}`)}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT: particle laptop */}
          <div className="xl:col-span-5 h-[420px] md:h-[520px] xl:h-full relative rounded-2xl overflow-hidden bg-paper-2">
            <div
              className="absolute inset-0 dots"
              style={{ maskImage: "radial-gradient(ellipse at center, #000, transparent 75%)" }}
              aria-hidden="true"
            />
            <ContactExperience />
            <div className="absolute left-5 right-5 bottom-5 flex items-center justify-between gap-3 text-[12px] font-mono text-ink/60 pointer-events-none">
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-accent animate-pulse" />
                {t("deploy.scene")}
              </span>
              <span>net: none</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
