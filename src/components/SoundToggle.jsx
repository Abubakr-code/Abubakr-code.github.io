import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { createAmbient } from "../audio/ambient";

const KEY = "armorix_sound";

// Music is on by default; only an explicit "off" from the visitor keeps it silent.
const readPref = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

const writePref = (on) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // storage can be unavailable (private mode); the toggle still works
  }
};

// Sound pill. Music starts with the visitor's first click / tap / key press (browsers
// forbid sound before that) unless they switched it off before — that choice is remembered.
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
    // Browsers block sound until the first user gesture. Try right away (allowed for
    // sites the visitor engages with often), otherwise start on the first click / tap / key.
    engine.current ??= createAmbient();
    if (engine.current.allowed) {
      engine.current.start();
      setOn(true);
      return undefined;
    }
    const events = ["pointerdown", "keydown", "touchend"];
    const detach = () => events.forEach((e) => window.removeEventListener(e, resume, true));
    function resume(e) {
      detach();
      // A click on the pill itself is handled by its own onClick.
      if (e.target.closest?.(".sound-toggle")) return;
      engine.current.start();
      setOn(true);
    }
    events.forEach((e) => window.addEventListener(e, resume, true));
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
