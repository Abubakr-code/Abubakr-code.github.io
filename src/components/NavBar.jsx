import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Moon, Sun, X } from "lucide-react";

import { navLinks } from "../constants";
import { toggleTheme, useTheme } from "../theme";

const LANGS = ["uz", "ru", "en"];

const NavBar = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const current = (i18n.language || "uz").slice(0, 2);
  const dark = useTheme() === "dark";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

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
    <header className={`navbar ${scrolled || open ? "scrolled" : "not-scrolled"} ${open ? "menu-open" : ""}`}>
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
          <button
            type="button"
            className="menu-toggle lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("menu.close") : t("menu.open")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phones / tablets: the section links live in a drop-down panel */}
      <nav id="mobile-menu" className="mobile-menu lg:hidden" hidden={!open}>
        {[...navLinks, { key: "nav.deploy", href: "#contact" }].map(({ href, key }, i) => (
          <a key={key} href={href} onClick={() => setOpen(false)} className="mobile-link">
            <span className="num text-accent">0{i + 1}</span>
            {t(key)}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default NavBar;
