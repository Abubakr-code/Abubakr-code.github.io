import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uzTranslation from "./locales/uz.json";
import ruTranslation from "./locales/ru.json";
import enTranslation from "./locales/en.json";

const resources = {
  uz: { translation: uzTranslation },
  ru: { translation: ruTranslation },
  en: { translation: enTranslation }
};

const savedLang = typeof window !== "undefined" ? localStorage.getItem("armorix_lang") : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || "uz", // Default to Uzbek
    fallbackLng: "uz",
    supportedLngs: ["uz", "ru", "en"],
    load: "languageOnly",
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "armorix_lang",
      caches: ["localStorage"]
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
