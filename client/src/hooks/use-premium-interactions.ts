import { useEffect } from "react";
import { useLocation } from "wouter";

const MAX_TILT_DEG = 5;
const MAGNETIC_OFFSET = 10;

const formatDeg = (value: number) => `${value.toFixed(2)}deg`;
const formatPx = (value: number) => `${value.toFixed(2)}px`;

const formatTiltRotate = (xDeg: number, yDeg: number) => {
  const magnitude = Math.hypot(xDeg, yDeg);

  if (magnitude < 0.01) {
    return "0deg";
  }

  const axisX = (xDeg / magnitude).toFixed(4);
  const axisY = (yDeg / magnitude).toFixed(4);

  return `${axisX} ${axisY} 0 ${formatDeg(magnitude)}`;
};

export default function usePremiumInteractions() {
  const [location] = useLocation();

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
      const initialTransform = node.style.transform;
      const initialRotate = node.style.rotate;
      const initialTranslate = node.style.translate;
      const initialScale = node.style.scale;
      let frameId: number | null = null;

      const handleMove = (event: MouseEvent) => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }

        frameId = requestAnimationFrame(() => {
          frameId = null;

          const rect = node.getBoundingClientRect();
          const px = event.clientX - rect.left;
          const py = event.clientY - rect.top;
          const nx = px / rect.width - 0.5;
          const ny = py / rect.height - 0.5;

          node.style.setProperty("--glow-x", `${px}px`);
          node.style.setProperty("--glow-y", `${py}px`);

          if (mode === "tilt") {
            const rotateXDeg = -ny * MAX_TILT_DEG;
            const rotateYDeg = nx * MAX_TILT_DEG;

            node.style.rotate = formatTiltRotate(rotateXDeg, rotateYDeg);
            node.style.translate = "0 0 0.01px";
            return;
          }

          if (mode === "magnetic") {
            node.style.translate = `${formatPx(nx * MAGNETIC_OFFSET)} ${formatPx(ny * MAGNETIC_OFFSET)}`;
            node.style.scale = "1.02";
          }
        });
      };

      const handleLeave = () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }

        if (mode === "tilt") {
          node.style.rotate = "0deg";
          node.style.translate = initialTranslate;
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
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }

        node.removeEventListener("mousemove", handleMove);
        node.removeEventListener("mouseleave", handleLeave);
        node.style.transform = initialTransform;
        node.style.rotate = initialRotate;
        node.style.translate = initialTranslate;
        node.style.scale = initialScale;
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [location]);
}
