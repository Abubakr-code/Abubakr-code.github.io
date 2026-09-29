import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";

import { navLinks } from "../constants";
import { toggleTheme, useTheme } from "../theme";

const LANGS = ["uz", "ru", "en"];

const NavBar = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const current = (i18n.language || "uz").slice(0, 2);
  const dark = useTheme() === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("armorix_lang", lng);
    } catch {
      // storage can be unavailable (private mode); the switch still applies
    }
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
      <div className="inner">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <img src="/favicon.svg" alt="" className="size-8 rounded-lg transition-transform duration-500 group-hover:rotate-[60deg]" />
          <span className="text-[19px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Armorix
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map(({ href, key }) => (
            <a key={key} href={href} className="nav-link">
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
            title={dark ? t("theme.toLight") : t("theme.toDark")}
          >
            <Sun className={`size-[18px] ${dark ? "is-shown" : ""}`} />
            <Moon className={`size-[18px] ${dark ? "" : "is-shown"}`} />
          </button>
          <div className="flex items-center text-[13px] font-medium">
            {LANGS.map((lng, i) => (
              <span key={lng} className="flex items-center">
                {i > 0 && <span className="mx-1.5 text-ink/20">|</span>}
                <button
                  type="button"
                  onClick={() => setLang(lng)}
                  className={`uppercase cursor-pointer transition-colors ${current === lng ? "text-ink" : "text-ink/40 hover:text-ink"}`}
                >
                  {lng}
                </button>
              </span>
            ))}
          </div>
          <a href="#contact" className="btn-ink !h-10 !px-5 !text-[15px] hidden sm:inline-flex">
            {t("nav.deploy")}
          </a>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
