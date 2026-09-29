import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { navLinks } from "../constants";
import ParticleWordmark from "../components/models/footer/ParticleWordmark";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-night text-white overflow-hidden">
      <div className="container-x pt-24 pb-10">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="h-section">{t("footer.title")}</h2>
            <a href="#contact" className="btn-ink !bg-white !text-night hover:!bg-accent hover:!text-white mt-8 group">
              {t("hero.btn")}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
          <nav className="lg:col-span-5 grid grid-cols-2 gap-3 content-start text-white/60">
            {navLinks.map(({ href, key }) => (
              <a key={key} href={href} className="hover:text-white transition-colors w-fit">
                {t(key)}
              </a>
            ))}
            <a href="#contact" className="hover:text-white transition-colors w-fit">
              {t("nav.deploy")}
            </a>
          </nav>
        </div>

        {/* Oversized particle wordmark */}
        <div className="relative mt-16 -mx-5 md:-mx-10 aspect-[3/1] md:aspect-[4/1]" aria-hidden="true">
          <ParticleWordmark className="absolute inset-0" />
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-3 border-t border-white/10 pt-6 mt-4 text-[13px] text-white/40">
          <span>{t("footer.copyright")}</span>
          <span>{t("footer.offline")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
