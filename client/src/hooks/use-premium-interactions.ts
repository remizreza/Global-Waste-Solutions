import { useEffect } from "react";

const MAX_TILT_DEG = 5;
const MAGNETIC_OFFSET = 10;

export default function usePremiumInteractions() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !finePointer) return;

    const interactiveNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-premium-interactive]")
    );

    if (!interactiveNodes.length) return;

    const cleanups = interactiveNodes.map((node) => {
      const mode = node.dataset.premiumMode ?? "glow";

      const handleMove = (event: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        const nx = px / rect.width - 0.5;
        const ny = py / rect.height - 0.5;

        node.style.setProperty("--glow-x", `${px}px`);
        node.style.setProperty("--glow-y", `${py}px`);

        if (mode === "tilt") {
          node.style.transform = `perspective(1000px) rotateX(${(-ny * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(nx * MAX_TILT_DEG).toFixed(2)}deg) translateZ(0)`;
          return;
        }

        if (mode === "magnetic") {
          node.style.transform = `translate3d(${(nx * MAGNETIC_OFFSET).toFixed(2)}px, ${(ny * MAGNETIC_OFFSET).toFixed(2)}px, 0) scale(1.02)`;
        }
      };

      const handleLeave = () => {
        node.style.transform = "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)";
      };

      node.addEventListener("mousemove", handleMove);
      node.addEventListener("mouseleave", handleLeave);

      return () => {
        node.removeEventListener("mousemove", handleMove);
        node.removeEventListener("mouseleave", handleLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}

