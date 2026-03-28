import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const userAgent = window.navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const canUseCursor = !prefersReduced && finePointer && !coarsePointer && !isSafari;

    setEnabled(canUseCursor);
    document.body.dataset.customCursor = canUseCursor ? "true" : "false";
    if (!canUseCursor) {
      return () => {
        delete document.body.dataset.customCursor;
      };
    }

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isVisible = false;
    let isHovering = false;
    let isPressed = false;

    const updateState = () => {
      cursor.dataset.visible = String(isVisible);
      cursor.dataset.hover = String(isHovering);
      cursor.dataset.pressed = String(isPressed);
    };

    const handleMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      isVisible = true;
      updateState();
    };

    const handleLeave = () => {
      isVisible = false;
      updateState();
    };

    const handleDown = () => {
      isPressed = true;
      updateState();
    };

    const handleUp = () => {
      isPressed = false;
      updateState();
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      isHovering = Boolean(
        target.closest(
          "a,button,[role='button'],input,textarea,select,.product-card,.link-premium,.btn-premium,.btn-premium-outline,.btn-whatsapp-premium",
        ),
      );
      updateState();
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    updateState();
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseover", handleOver);
    raf = requestAnimationFrame(tick);

    return () => {
      delete document.body.dataset.customCursor;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseover", handleOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-visible="false"
      data-hover="false"
      data-pressed="false"
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[9999]"
    >
      <div className="custom-cursor__halo" />
      <div className="custom-cursor__ring" />
      <div className="custom-cursor__orbit" />
      <div className="custom-cursor__core" />
    </div>
  );
}
