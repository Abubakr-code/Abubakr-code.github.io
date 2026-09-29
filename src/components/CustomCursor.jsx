import { useEffect, useRef } from "react";

const HOVER = "a, button, [role='button'], label, select, summary";
const TEXT = "input, textarea, [contenteditable='true']";

// Scanner-viewfinder cursor: an accent dot glued to the pointer and four corner
// brackets that trail it. Brackets open up over links/buttons and turn into a
// spinning dashed ring over draggable 3D. Fine pointers only; touch and
// reduced-motion visitors keep the native cursor.
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return undefined;

    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    root.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;

    const tick = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      root.classList.add("cursor-visible");
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const el = e.target;
      ring.classList.toggle("is-hover", !!el.closest?.(HOVER));
      ring.classList.toggle("is-drag", !!el.closest?.("[data-cursor='drag']") && !el.closest?.(HOVER));
      root.classList.toggle("cursor-text", !!el.closest?.(TEXT));
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => root.classList.remove("cursor-visible");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor", "cursor-visible", "cursor-text");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <i />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
