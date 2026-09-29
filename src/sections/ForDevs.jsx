import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import useAutoStage from "../hooks/useAutoStage";
import MorphScene from "../components/three/MorphScene";
import { coins, hourglass, laptop } from "../components/three/shapes";
import { devPersonas } from "../constants";

gsap.registerPlugin(ScrollTrigger);

// Cost story: pentest invoice → weeks of waiting → your own laptop.
const SHAPES = [coins, hourglass, laptop];

// 02 — who Armorix is for: developers who can't hire a pentester.
const ForDevs = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const stage = useRef(0);
  const progress = useRef(0);
  const [active, select] = useAutoStage(SHAPES.length, sectionRef, stage);

  useGSAP(
    () => {
      gsap.fromTo(
        ".dev-card",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".dev-grid", start: "top 80%" } }
      );
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => (progress.current = self.progress),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="devs" ref={sectionRef} className="relative py-28 md:py-40 bg-paper-2/60">
      <div className="container-x">
        <SectionLabel index="02">{t("section.devs")}</SectionLabel>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <h2 className="h-section">{t("devs.title")}</h2>
            <p className="lead mt-6 max-w-2xl">{t("devs.lead")}</p>

            {/* Cost contrast */}
            <div className="grid sm:grid-cols-2 gap-3 mt-10">
              <div
                className={`rounded-2xl border border-line bg-card p-6 transition-opacity duration-500 ${active < 2 ? "" : "opacity-50"}`}
                onPointerEnter={() => select(0)}
              >
                <p className="text-[12px] uppercase tracking-[0.14em] text-muted font-semibold">{t("devs.vs.them.label")}</p>
                <p className="num text-[44px] md:text-[52px] text-ink/40 line-through decoration-2 mt-2">{t("devs.vs.them.value")}</p>
                <p className="text-sm text-muted mt-1">{t("devs.vs.them.note")}</p>
              </div>
              <div className={`terminal p-6 transition-transform duration-500 ${active === 2 ? "scale-[1.03]" : ""}`} onPointerEnter={() => select(2)}>
                <p className="text-[12px] uppercase tracking-[0.14em] text-accent-2 font-semibold">{t("devs.vs.us.label")}</p>
                <p className="num text-[44px] md:text-[52px] text-white mt-2">{t("devs.vs.us.value")}</p>
                <p className="text-sm text-white/60 mt-1">{t("devs.vs.us.note")}</p>
              </div>
            </div>
          </div>

          {/* 3D: coins → hourglass → laptop */}
          <div className="lg:col-span-5 relative h-[360px] md:h-[480px]">
            <MorphScene className="absolute inset-0" shapes={SHAPES} stage={stage} progress={progress} spin={0.6} />
            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between font-mono text-[12px] text-muted">
              <span>
                <span className="text-accent">0{active + 1}</span> · {t(`devs.scene.s${active + 1}`)}
              </span>
              <span className="progress-dashes">
                {SHAPES.map((shape, i) => (
                  <span key={i} className={i <= active ? "on" : ""} onPointerEnter={() => select(i)} />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Personas */}
        <div className="dev-grid grid md:grid-cols-3 gap-4 mt-16">
          {devPersonas.map((item) => {
            const { key, Icon } = item;
            return (
              <article key={key} className="dev-card card p-8">
                <span className="card-dots" />
                <span className="flex items-center justify-center size-12 rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-6" />
                </span>
                <p className="kicker mt-8">{t(`devs.${key}.kicker`)}</p>
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">{t(`devs.${key}.title`)}</h3>
                <p className="text-muted leading-relaxed">{t(`devs.${key}.desc`)}</p>
              </article>
            );
          })}
        </div>

        {/* localhost ≠ protected */}
        <div className="mt-4 rounded-2xl border border-line bg-card p-8 md:p-10 grid md:grid-cols-12 gap-6 items-center">
          <p className="md:col-span-5 font-mono text-[15px] md:text-base text-ink">
            <span className="text-muted">$</span> npm run dev
            <br />
            <span className="text-muted">➜</span> Local: <span className="text-accent">http://localhost:3000</span>
            <br />
            <span className="text-ink/40">✗</span> <span className="underline decoration-accent decoration-2 underline-offset-4">{t("devs.localhost.fake")}</span>
          </p>
          <div className="md:col-span-7">
            <h3 className="text-2xl md:text-[28px] font-semibold tracking-tight">{t("devs.localhost.title")}</h3>
            <p className="text-muted leading-relaxed mt-3">{t("devs.localhost.desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForDevs;
