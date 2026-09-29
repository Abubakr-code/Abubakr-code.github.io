import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import NumbersScene from "../components/models/numbers/NumbersScene";
import { numbers } from "../constants";

gsap.registerPlugin(ScrollTrigger);

const Numbers = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const stage = useRef(0);
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState(0);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${numbers.length * 90}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress * numbers.length;
          const idx = Math.min(numbers.length - 1, Math.floor(p));
          stage.current = idx;
          setActive((prev) => (prev === idx ? prev : idx));
          setFill(Math.min(1, p - idx));
        },
      });
    },
    { scope: sectionRef }
  );

  const item = numbers[active];

  return (
    <section id="numbers" ref={sectionRef} className="relative h-svh overflow-hidden">
      <div className="container-x h-full grid lg:grid-cols-2 gap-6 items-center pt-20 pb-8">
        <div className="relative z-10 order-2 lg:order-1">
          <SectionLabel index="03">{t("section.numbers")}</SectionLabel>

          {/* keyed so each stat re-runs the enter animation */}
          <div key={item.key} className="animate-[stat-in_0.6s_cubic-bezier(0.2,0.8,0.2,1)]">
            <p className="kicker mb-3">{t(`numbers.${item.key}.kicker`)}</p>
            <p className="num text-[96px] sm:text-[140px] xl:text-[180px] text-ink leading-[0.85]">{item.value}</p>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mt-4">{t(`numbers.${item.key}.label`)}</p>
            <p className="lead max-w-md mt-5">{t(`numbers.${item.key}.desc`)}</p>
          </div>

          <div className="progress-dashes mt-9">
            {numbers.map((n, i) => (
              <span key={n.key} className={i < active ? "on" : ""} style={i === active ? { background: `linear-gradient(90deg, var(--color-accent) ${fill * 100}%, var(--color-line) ${fill * 100}%)` } : undefined} />
            ))}
          </div>
        </div>

        <div className="relative order-1 lg:order-2 h-[36vh] lg:h-[80vh]">
          <NumbersScene stage={stage} />
        </div>
      </div>
    </section>
  );
};

export default Numbers;
