import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Preloader = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Increment progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 12);
      });
    }, 70);

    // After 1.2s, start fade out
    const fadeTimer = setTimeout(() => {
      setProgress(100);
      setFading(true);
    }, 1100);

    // After 1.8s, completely remove from DOM
    const removeTimer = setTimeout(() => {
      setRemoved(true);
      document.body.style.overflow = "";
    }, 1700);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] bg-paper flex flex-col items-center justify-center transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      <div className="flex flex-col items-center w-full max-w-xs px-5">
        <img src="/favicon.svg" alt="" className="size-12 rounded-xl mb-6" />
        <p className="text-3xl font-extrabold tracking-tight mb-8" style={{ fontFamily: "var(--font-display)" }}>
          Armorix
        </p>
        <div className="w-full h-[3px] bg-line rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 w-full flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
          <span>{t("preloader.status")}</span>
          <span className="text-ink font-semibold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
