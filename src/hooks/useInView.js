import { useEffect, useState } from "react";

// Tracks whether an element is near the viewport. Used to pause 3D render loops
// for canvases that are scrolled out of sight.
const useInView = (ref, rootMargin = "200px") => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
};

export default useInView;
