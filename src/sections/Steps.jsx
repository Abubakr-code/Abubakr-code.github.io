import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import MorphScene from "../components/three/MorphScene";
import { codePage, packageCube, patch, report, taint } from "../components/three/shapes";
import { steps } from "../constants";

gsap.registerPlugin(ScrollTrigger);

// Install → scan → analyse → patch → report.
const SHAPES = [packageCube, codePage, taint, patch, report];

// Pinned section; vertical scroll drives the card rail sideways while the
// 3D stage on the left morphs into the current step.
const Steps = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const stage = useRef(0);
  const progress = useRef(0);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const rail = railRef.current;
      const distance = () => Math.max(0, rail.scrollWidth - rail.parentElement.clientWidth);
      gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.3}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(".steps-progress", { scaleX: self.progress });
            progress.current = self.progress;
            const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
            stage.current = idx;
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="steps" ref={sectionRef} className="relative h-screen overflow-hidden flex items-center">
      <div className="container-x grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* LEFT: heading + 3D stage */}
        <div className="lg:col-span-5">
          <SectionLabel index="04">{t("section.steps")}</SectionLabel>
          <h2 className="h-section">{t("steps.title")}</h2>
          <p className="text-muted mt-4">{t("steps.lead")}</p>
          <div className="relative h-px bg-line mt-6">
            <div className="steps-progress absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-accent h-[2px] -top-px" />
          </div>
          <div className="relative h-[22vh] lg:h-[40vh] mt-2 -mx-5">
            <MorphScene className="absolute inset-0" shapes={SHAPES} stage={stage} progress={progress} count={2200} distance={9.5} />
            <p className="absolute left-5 bottom-0 font-mono text-[12px] text-muted">
              <span className="text-accent">0{active + 1}</span> · {t(`steps.${steps[active]}.title`)}
            </p>
          </div>
        </div>

        {/* RIGHT: rail */}
        <div className="lg:col-span-7 overflow-hidden -mr-5 md:-mr-10 lg:mr-0 py-4">
          <div ref={railRef} className="flex gap-5 w-max pr-10">
            {steps.map((key, i) => (
              <article key={key} className={`card step-card ${i === active ? "is-live" : ""}`}>
                <span className="card-dots" />
                <span className="num text-[64px] md:text-[72px] text-accent">0{i + 1}</span>
                <h3 className="text-2xl font-semibold mt-auto pt-10">{t(`steps.${key}.title`)}</h3>
                <p className="kicker !text-[11px] mt-1.5">{t(`steps.${key}.meta`)}</p>
                <p className="text-muted leading-relaxed mt-4">{t(`steps.${key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
