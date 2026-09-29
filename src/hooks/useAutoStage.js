import { useEffect, useRef, useState } from "react";

import useInView from "./useInView";

// Cycles a 3D stage while its section is on screen; hovering an item pins
// that item for a few seconds. Keeps `stage` (the ref MorphScene reads) in sync.
const useAutoStage = (count, sectionRef, stage, interval = 4500) => {
  const inView = useInView(sectionRef, "-20% 0px");
  const [active, setActive] = useState(0);
  const holdUntil = useRef(0);

  useEffect(() => {
    stage.current = active;
  }, [active, stage]);

  useEffect(() => {
    if (!inView) return undefined;
    const id = setInterval(() => {
      if (Date.now() < holdUntil.current) return;
      setActive((a) => (a + 1) % count);
    }, interval);
    return () => clearInterval(id);
  }, [inView, count, interval]);

  const select = (i) => {
    holdUntil.current = Date.now() + 6000;
    setActive(i);
  };

  return [active, select];
};

export default useAutoStage;
