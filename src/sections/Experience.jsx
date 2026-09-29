import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import SectionLabel from "../components/SectionLabel";
import MorphScene from "../components/three/MorphScene";
import { codePage, seal, waves } from "../components/three/shapes";
import { expCards } from "../constants";

gsap.registerPlugin(ScrollTrigger);

// AST engine, zero-network wall, signed report seal.
const SHAPES = [codePage, waves, seal];

// Sticky oversized index on the left follows whichever deep-dive is in view.
const Experience = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const stage = useRef(0);
  const progress = useRef(0);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => (progress.current = self.progress),
      });
      gsap.utils.toArray(".inside-entry").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(i);
            stage.current = i;
          },
        });
        gsap.fromTo(
          el.querySelectorAll(".term-line"),
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, stagger: 0.12, duration: 0.3, scrollTrigger: { trigger: el, start: "top 70%" } }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="experience" ref={sectionRef} className="relative py-28 md:py-40 bg-paper-2/60">
      <div className="container-x">
        <SectionLabel index="06">{t("section.inside")}</SectionLabel>
        <h2 className="h-section max-w-3xl">{t("exp.title")}</h2>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-16">
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28">
              <p key={active} className="num text-[120px] xl:text-[150px] leading-[0.85] animate-[stat-in_0.5s_ease-out]">
                0{active + 1}
              </p>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mt-4">{t(expCards[active].titleKey)}</p>
              <div className="progress-dashes mt-6">
                {expCards.map((c, i) => (
                  <span key={c.titleKey} className={i <= active ? "on" : ""} />
                ))}
              </div>
              <div className="relative h-[340px] xl:h-[380px] mt-4 -mx-8">
                <MorphScene className="absolute inset-0" shapes={SHAPES} stage={stage} progress={progress} count={2200} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-24 md:space-y-32">
            {expCards.map((card, i) => (
              <article key={card.titleKey} className="inside-entry">
                <div className="flex items-baseline gap-4">
                  <span className="num text-[44px] text-accent lg:hidden">0{i + 1}</span>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {t(card.titleKey)}
                  </h3>
                </div>
                <p className="lead mt-4 max-w-2xl">{t(card.descKey)}</p>

                <div className="terminal mt-8">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-white/20" />
                      <span className="size-2.5 rounded-full bg-white/20" />
                      <span className="size-2.5 rounded-full bg-white/20" />
                    </div>
                    <span className="font-mono text-[11px] text-white/40">{card.host}</span>
                  </div>
                  <div className="p-5 md:p-6 font-mono text-xs md:text-sm leading-7 overflow-x-auto">
                    {card.lines.map(([cls, text], j) => (
                      <div key={j} className={`term-line whitespace-pre ${cls}`}>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="grid md:grid-cols-3 gap-4 mt-6">
                  {card.responsibilitiesKeys.map((key) => (
                    <li key={key} className="card !shadow-none border border-line p-5 text-sm leading-relaxed text-ink/75">
                      <Check className="size-4 text-accent mb-3" strokeWidth={2.5} />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
