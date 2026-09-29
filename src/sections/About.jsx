import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import useAutoStage from "../hooks/useAutoStage";
import MorphScene from "../components/three/MorphScene";
import { airgap, neural, patch, tree } from "../components/three/shapes";
import { aboutCards } from "../constants";

gsap.registerPlugin(ScrollTrigger);

// One shape per card: air gap, AST, neural engine, patch.
const SHAPES = [airgap, tree, neural, patch];

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const stage = useRef(0);
  const progress = useRef(0);
  const [active, select] = useAutoStage(aboutCards.length, sectionRef, stage);

  useGSAP(
    () => {
      gsap.fromTo(
        ".about-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".about-grid", start: "top 80%" },
        }
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
    <section id="about" ref={sectionRef} className="relative py-28 md:py-40">
      <div className="container-x grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionLabel index="01">{t("section.about")}</SectionLabel>
            <h2 className="h-section">{t("about.title")}</h2>
            <div className="relative h-[320px] lg:h-[440px] mt-6 -mx-5 lg:-mx-8">
              <MorphScene className="absolute inset-0" shapes={SHAPES} stage={stage} progress={progress} />
              <p className="absolute left-5 lg:left-8 bottom-2 font-mono text-[12px] text-muted">
                <span className="text-accent">0{active + 1}</span> / 0{aboutCards.length} · {t(`about.${aboutCards[active]}.title`)}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <p className="text-lg md:text-xl leading-relaxed text-ink/80 max-w-3xl">{t("about.lead")}</p>

          <div className="about-grid grid sm:grid-cols-2 gap-4 mt-12">
            {aboutCards.map((key, i) => (
              <article key={key} className={`about-card card p-8 md:p-9 ${i === active ? "is-live" : ""}`} onPointerEnter={() => select(i)}>
                <span className="card-dots" />
                <span className="num text-[56px] md:text-[64px] text-accent block">0{i + 1}</span>
                <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3">{t(`about.${key}.title`)}</h3>
                <p className="text-muted leading-relaxed">{t(`about.${key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;