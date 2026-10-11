import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

import { hasWebGL } from "../utils/webgl";

// Shown only when the browser cannot draw 3D (hardware acceleration off): says why the
// particle scenes are replaced by a static pattern and what to switch on.
const WebGLNotice = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  if (hasWebGL() || !open) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[60] flex w-[min(92vw,560px)] -translate-x-1/2 items-start gap-3 rounded-2xl bg-night px-5 py-4 text-[13px] leading-relaxed text-white/90 shadow-2xl ring-1 ring-white/15"
    >
      <p className="flex-1">{t("webgl.off")}</p>
      <button type="button" onClick={() => setOpen(false)} aria-label={t("webgl.close")} className="mt-0.5 shrink-0 opacity-70 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
};

export default WebGLNotice;
