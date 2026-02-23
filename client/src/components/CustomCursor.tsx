import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || coarsePointer) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isActive = false;

    const handleMove = (event: MouseEvent) => {
      targetX = event.clientX - 8;
      targetY = event.clientY - 8;
    };
    const handleDown = () => {
      isActive = true;
      cursor.classList.add("is-active");
    };
    const handleUp = () => {
      isActive = false;
      cursor.classList.remove("is-active");
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const isInteractive =
        !!target.closest(
          "a,button,[role='button'],.product-card,.link-premium,.btn-premium,.btn-premium-outline",
        );
      if (isInteractive !== isActive) {
        isActive = isInteractive;
        cursor.classList.toggle("is-active", isActive);
      }
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseover", handleOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseover", handleOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor fixed left-0 top-0 z-[80] pointer-events-none"
    >
      <div className="h-4 w-4 rotate-45 border border-white/40" />
    </div>
  );
}
