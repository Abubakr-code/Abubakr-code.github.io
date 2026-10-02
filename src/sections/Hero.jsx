import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { integrations, words } from "../constants";
import HeroExperience from "../components/models/hero_models/HeroExperience";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const scroll = useRef(0);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 1.1 });
      tl.fromTo(".hero-badge", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo(".hero-text h1", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.12, duration: 0.9 }, "-=0.3")
        .fromTo(".hero-fade", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.7 }, "-=0.5")
        .fromTo(".hero-3d-layout", { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.1);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => (scroll.current = self.progress),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="hero" ref={sectionRef} className="relative overflow-hidden flex flex-col min-h-svh">
      {/* dotted texture, lower-left like a print halftone */}
      <div
        className="absolute left-0 bottom-0 w-[55%] h-[60%] dots pointer-events-none"
        style={{ maskImage: "radial-gradient(ellipse at bottom left, #000, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="hero-layout flex-1">
        {/* LEFT: copy — never wider than half, so it can't overlap the 3D shield */}
        <header className="flex flex-col justify-center w-full xl:max-w-[50%] relative z-20 py-6 xl:py-0">
          <div className="flex flex-col gap-7">
            <div className="hero-badge">
              <span className="size-5 rounded-full bg-accent/10 flex-center">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              </span>
              {t("hero.badge")}
            </div>

            <div className="hero-text">
              <h1 className="flex items-center gap-3 whitespace-nowrap">
                <span>{t("hero.title1")}</span>
                <span className="slide h-8 sm:h-10 md:h-12 xl:h-14 overflow-hidden">
                  <span className="wrapper">
                    {words.map((word, index) => {
                      const { key, Icon } = word;
                      return (
                        <span key={index} className="h-8 sm:h-10 md:h-12 xl:h-14 flex items-center gap-2.5 shrink-0 overflow-hidden">
                          <span className="size-7 sm:size-8 md:size-10 rounded-xl bg-accent flex-center">
                            <Icon className="size-4 sm:size-5 text-white" strokeWidth={2.2} />
                          </span>
                          <span className="text-accent">{t(`hero.word.${key}`)}</span>
                        </span>
                      );
                    })}
                  </span>
                </span>
              </h1>
              <h1>{t("hero.title2")}</h1>
              <h1 className="text-ink/35">{t("hero.title3")}</h1>
            </div>

            <p className="hero-fade lead max-w-lg">{t("hero.desc")}</p>

            <div className="hero-fade flex flex-wrap items-center gap-3">
              <a href="#contact" className="btn-ink group">
                {t("hero.btn")}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#lab" className="btn-line">
                {t("hero.btnLab")}
              </a>
            </div>
          </div>
        </header>

        {/* RIGHT: particle shield */}
        <figure className="w-full xl:w-[50%] relative xl:static z-10">
          <div className="hero-3d-layout">
            <HeroExperience scroll={scroll} />
          </div>
        </figure>
      </div>

      {/* Bottom strip: integrations + two live figures */}
      <div className="hero-fade relative z-20 container-x pb-7 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
          <span className="text-[13px] text-muted shrink-0">{t("hero.integrations")}</span>
          <div className="marquee flex-1 min-w-0">
            <div className="marquee-track">
              {[...integrations, ...integrations].map((name, i) => (
                <img key={i} src={`/images/integrations/${name}.svg`} alt={name} className="h-6 w-auto opacity-35" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8 shrink-0 text-[13px] text-muted">
            <span className="flex items-baseline gap-2">
              <span className="size-1.5 rounded-sm bg-accent self-center" />
              <b className="text-ink text-[17px] font-semibold">253,924</b>
              {t("hero.stat1")}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="size-1.5 rounded-sm bg-accent self-center" />
              <b className="text-ink text-[17px] font-semibold">0 B</b>
              {t("hero.stat2")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
