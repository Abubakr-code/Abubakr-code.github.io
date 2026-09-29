import { useRef } from "react";
import { useTranslation } from "react-i18next";

import SectionLabel from "../components/SectionLabel";
import { TechIconView, TechViewCanvas } from "../components/models/tech_logos/TechIconCardExperience";
import { techStackIcons } from "../constants";

const TechCard = ({ model }) => {
  const hovered = useRef(false);
  return (
    <div
      className="card group"
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <div className="tech-card__stage">
        <TechIconView model={model} hovered={hovered} className="absolute inset-0" />
      </div>
      <div className="text-center pb-5 px-2">
        <p className="font-semibold">{model.name}</p>
        <p className="font-mono text-[11px] text-muted mt-1 group-hover:text-accent transition-colors">{model.ext}</p>
      </div>
    </div>
  );
};

const TechStack = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  return (
    <section id="skills" ref={sectionRef} className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionLabel index="07">{t("section.tech")}</SectionLabel>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="h-section max-w-3xl">{t("tech.title")}</h2>
          <p className="text-muted md:text-right max-w-xs">{t("tech.subtitle2")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-14">
          {techStackIcons.map((model) => (
            <TechCard key={model.name} model={model} />
          ))}
        </div>
      </div>

      <TechViewCanvas sectionRef={sectionRef} />
    </section>
  );
};

export default TechStack;
