import { useEffect } from "react";

const MAX_TILT_DEG = 5;
const MAGNETIC_OFFSET = 10;

const formatDeg = (value: number) => `${value.toFixed(2)}deg`;

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
          node.style.rotate = `x ${formatDeg(-ny * MAX_TILT_DEG)} y ${formatDeg(nx * MAX_TILT_DEG)}`;
          return;
        }

        if (mode === "magnetic") {
          node.style.translate = `${(nx * MAGNETIC_OFFSET).toFixed(2)}px ${(ny * MAGNETIC_OFFSET).toFixed(2)}px`;
          node.style.scale = "1.02";
        }
      };

      const handleLeave = () => {
        if (mode === "tilt") {
          node.style.rotate = "x 0deg y 0deg";
          return;
        }

        if (mode === "magnetic") {
          node.style.translate = "0 0";
          node.style.scale = "1";
        }
      };

      node.addEventListener("mousemove", handleMove);
      node.addEventListener("mouseleave", handleLeave);

      return () => {
        node.removeEventListener("mousemove", handleMove);
        node.removeEventListener("mouseleave", handleLeave);
        node.style.rotate = "";
        node.style.translate = "";
        node.style.scale = "";
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}
