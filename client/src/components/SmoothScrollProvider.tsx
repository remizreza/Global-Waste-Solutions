import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScrollProvider() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || coarsePointer || !finePointer) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: false,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
