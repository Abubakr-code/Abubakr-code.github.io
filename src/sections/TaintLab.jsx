import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, RotateCcw, Wrench, WifiOff, Timer, Target, Route } from "lucide-react";

import SectionLabel from "../components/SectionLabel";
import TaintGraph from "../components/models/lab/TaintGraph";
import { labSamples } from "../constants/labSamples";
import useInView from "../hooks/useInView";

const KEYWORDS = new Set(
  "void char const return delete if func def int size_t auto for while struct class new nullptr".split(" ")
);

const TOKEN = /(f?"[^"]*")|(\b\d+\b)|(@\w+)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)/g;

// Tiny highlighter — enough to make the snippets readable without a dependency.
const highlight = (src) => {
  const out = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const [tok, str, num, deco, call, ident] = m;
    if (m.index > last) out.push(src.slice(last, m.index));
    const word = call || ident;
    const cls = str
      ? "text-mint"
      : num
        ? "text-signal"
        : deco || KEYWORDS.has(word)
          ? "text-accent-2"
          : call
            ? "text-white"
            : "";
    out.push(
      <span key={m.index} className={cls}>
        {tok}
      </span>
    );
    last = m.index + tok.length;
  }
  out.push(src.slice(last));
  return out;
};

// Merges original lines with the patch into a unified diff.
const buildDiff = (sample) => {
  const out = [];
  sample.code.forEach((line) => {
    const removed = sample.patch.remove.includes(line.n);
    out.push({ ...line, kind: removed ? "del" : "ctx" });
    sample.patch.add.filter((a) => a.after === line.n).forEach((a) => out.push({ n: "", t: a.t, kind: "add" }));
  });
  return out;
};

const TaintLab = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, "0px");
  const autoplayed = useRef(false);
  const timers = useRef([]);

  const [sampleIdx, setSampleIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [stamp, setStamp] = useState(0);

  const sample = labSamples[sampleIdx];

  const go = (next) => {
    setPhase(next);
    setStamp((s) => s + 1);
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const scan = () => {
    clearTimers();
    go("scanning");
    timers.current.push(setTimeout(() => go("found"), 1900));
  };

  const selectSample = (i) => {
    clearTimers();
    setSampleIdx(i);
    go("idle");
    timers.current.push(setTimeout(scan, 450));
  };

  useEffect(() => {
    if (inView && !autoplayed.current) {
      autoplayed.current = true;
      timers.current.push(setTimeout(scan, 600));
    }
    // scan only reads refs/setters, so it's safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => clearTimers, []);

  const showDiff = phase === "patched";
  const flagged = phase === "found" || phase === "patched";
  const lines = showDiff ? buildDiff(sample) : sample.code.map((l) => ({ ...l, kind: "ctx" }));
  const sourceLabel = sample.nodes.find((n) => n.id === sample.taint[0]).label.split(" ").pop();
  const sinkLabel = sample.nodes.find((n) => n.id === sample.taint[sample.taint.length - 1]).label.split(" ").pop();

  return (
    <section id="lab" ref={sectionRef} className="relative z-10 py-28 md:py-40 bg-night text-white overflow-hidden">
      {/* soft accent glow, the only colour cue in the dark section */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-accent/25 blur-[140px] pointer-events-none" />
      <div className="container-x relative">
        <SectionLabel index="08" dark>
          {t("section.lab")}
        </SectionLabel>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <h2 className="h-section max-w-3xl">{t("lab.title")}</h2>
          <p className="text-white/55 max-w-md md:text-right leading-relaxed">{t("lab.lead")}</p>
        </div>

        <div className="lab-shell mt-12">
          {/* toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 md:p-5 border-b border-white/5">
            <div className="flex flex-wrap gap-2" role="tablist">
              {labSamples.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === sampleIdx}
                  onClick={() => selectSample(i)}
                  className={`lab-tab ${i === sampleIdx ? "is-active" : ""}`}
                >
                  <span className="text-white/90">{s.lang}</span>
                  <span className="text-threat">{s.cwe}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`lab-phase lab-phase--${phase}`}>
                <span className="lab-phase__dot" />
                {t(`lab.phase.${phase}`)}
              </span>
              <button type="button" onClick={scan} disabled={phase === "scanning"} className="lab-btn lab-btn--primary">
                <Play className="size-3.5" />
                {t("lab.scan")}
              </button>
              <button type="button" onClick={() => go("patched")} disabled={phase !== "found"} className="lab-btn lab-btn--mint">
                <Wrench className="size-3.5" />
                {t("lab.patch")}
              </button>
              <button type="button" onClick={() => selectSample(sampleIdx)} className="lab-btn" aria-label={t("lab.reset")}>
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* code */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 font-mono text-[11px] text-white/40 border-b border-white/5">
                <span>{sample.file}</span>
                <span>{showDiff ? t("lab.diff") : t("lab.original")}</span>
              </div>
              <div className="flex-1 overflow-x-auto py-4 font-mono text-xs md:text-[13px] leading-7">
                {lines.map((line, i) => {
                  const role = flagged && line.kind === "ctx" ? line.role : undefined;
                  return (
                    <div key={`${phase}-${i}`} className={`code-line code-line--${line.kind} ${role ? `code-line--${role}` : ""}`}>
                      <span className="w-10 shrink-0 text-right pr-3 text-white/30 select-none">{line.n}</span>
                      <span className="w-4 shrink-0 select-none text-center">
                        {line.kind === "del" ? "−" : line.kind === "add" ? "+" : ""}
                      </span>
                      <span className="whitespace-pre pr-6">{highlight(line.t)}</span>
                      {role && <span className={`code-flag code-flag--${role}`}>{t(`lab.legend.${role}`)}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t border-white/5 min-h-[88px] text-sm leading-relaxed">
                {phase === "patched" ? (
                  <p className="text-mint/90">✓ {t(`lab.${sample.textKey}.fix`)}</p>
                ) : flagged ? (
                  <p className="text-white/75">
                    <span className="text-threat font-semibold">{sample.cwe}:</span> {t(`lab.${sample.textKey}.desc`)}
                  </p>
                ) : (
                  <p className="text-white/40">{t("lab.hint")}</p>
                )}
              </div>
            </div>

            {/* 3D graph */}
            <div data-cursor="drag" className="lg:col-span-7 relative h-[420px] md:h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(112,136,255,0.08),transparent_70%)]">
              <TaintGraph sample={sample} phase={phase} phaseStartedAt={stamp} />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] pointer-events-none">
                <span className="legend" style={{ "--dot": "var(--color-signal)" }}>{t("lab.legend.source")}</span>
                <span className="legend" style={{ "--dot": "var(--color-threat)" }}>{t("lab.legend.sink")}</span>
                <span className="legend" style={{ "--dot": "var(--color-mint)" }}>{t("lab.legend.sanitizer")}</span>
              </div>
              <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase pointer-events-none">
                {t("lab.drag")}
              </div>
            </div>
          </div>

          {/* findings strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5">
            <div className="lab-metric">
              <Target className="size-4 text-threat" />
              <div>
                <div className="lab-metric__label">{t("lab.severity")}</div>
                <div className={`lab-metric__value ${flagged ? "text-threat" : "text-white/30"}`}>
                  {flagged ? `${sample.severity} · ${sample.confidence}` : "—"}
                </div>
              </div>
            </div>
            <div className="lab-metric">
              <Route className="size-4 text-signal" />
              <div>
                <div className="lab-metric__label">{t("lab.path")}</div>
                <div className={`lab-metric__value ${flagged ? "text-white" : "text-white/30"}`}>
                  {flagged ? `${sourceLabel} → ${sinkLabel}` : "—"}
                </div>
              </div>
            </div>
            <div className="lab-metric">
              <Timer className="size-4 text-accent-2" />
              <div>
                <div className="lab-metric__label">{t("lab.time")}</div>
                <div className="lab-metric__value text-white">{phase === "idle" ? "—" : `${sample.time} s`}</div>
              </div>
            </div>
            <div className="lab-metric">
              <WifiOff className="size-4 text-mint" />
              <div>
                <div className="lab-metric__label">{t("lab.network")}</div>
                <div className="lab-metric__value text-mint">0 req · 0 B</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaintLab;
