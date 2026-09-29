import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { createAmbient } from "../audio/ambient";

const KEY = "armorix_sound";

const readPref = () => {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
};

const writePref = (on) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // storage can be unavailable (private mode); the toggle still works
  }
};

// Bottom-left sound pill. Browsers only allow audio after a user gesture, so
// a returning visitor who left music on hears it from their first click/key.
const SoundToggle = () => {
  const { t } = useTranslation();
  const engine = useRef(null);
  const [on, setOn] = useState(false);

  const play = () => {
    engine.current ??= createAmbient();
    engine.current.start();
    setOn(true);
    writePref(true);
  };

  const pause = () => {
    engine.current?.stop();
    setOn(false);
    writePref(false);
  };

  useEffect(() => {
    if (!readPref()) return undefined;
    const detach = () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    function resume(e) {
      detach();
      // A click on the pill itself is handled by its own onClick.
      if (e.target.closest?.(".sound-toggle")) return;
      engine.current ??= createAmbient();
      engine.current.start();
      setOn(true);
    }
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    return detach;
  }, []);

  useEffect(() => () => engine.current?.stop(), []);

  return (
    <button
      type="button"
      onClick={on ? pause : play}
      className={`sound-toggle ${on ? "is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? t("sound.off") : t("sound.on")}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="hidden sm:inline">{on ? t("sound.playing") : t("sound.label")}</span>
    </button>
  );
};

export default SoundToggle;
