import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import MorphScene from "../components/three/MorphScene";
import { airgap, infinity, memory, neural, report, waves } from "../components/three/shapes";
import { whyItems } from "../constants";

gsap.registerPlugin(ScrollTrigger);

// Air gap, blocked telemetry, neural engine, memory overflow, signed report, CI loop.
const SHAPES = [airgap, waves, neural, memory, report, infinity];

// Sticky heading on the left, list on the right; the item crossing the
// middle of the viewport lights up.
const Why = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const stage = useRef(0);
  const progress = useRef(0);

  useGSAP(
    () => {
      gsap.utils.toArray(".why-item").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 62%",
          toggleClass: "is-active",
          onToggle: (self) => self.isActive && (stage.current = i),
        });
      });
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
    <section id="why" ref={sectionRef} className="relative py-28 md:py-40">
      <div
        className="absolute left-0 top-1/3 w-1/2 h-2/3 dots pointer-events-none"
        style={{ maskImage: "radial-gradient(ellipse at bottom left, #000, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="container-x relative grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="05">{t("section.why")}</SectionLabel>
            <h2 className="h-section">{t("why.title")}</h2>
            <p className="lead mt-6 max-w-md">{t("why.lead")}</p>
            <div className="relative h-[300px] lg:h-[400px] mt-4 -mx-5 lg:-mx-8">
              <MorphScene className="absolute inset-0" shapes={SHAPES} stage={stage} progress={progress} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 border-t border-line">
          {whyItems.map((key, i) => (
            <div key={key} className="why-item">
              <span className="why-num">0{i + 1}</span>
              <div className="pt-2">
                <h3 className="text-2xl md:text-[28px] font-semibold tracking-tight">{t(`why.${key}.title`)}</h3>
                <p className="text-muted leading-relaxed mt-3 max-w-xl">{t(`why.${key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Why;
