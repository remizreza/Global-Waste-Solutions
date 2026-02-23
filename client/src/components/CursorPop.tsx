import { useEffect, useState } from "react";

export default function CursorPop() {
  const [enabled, setEnabled] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    setEnabled(finePointer);
    if (!finePointer) return;

    const onMove = (event: MouseEvent) => {
      setX(event.clientX);
      setY(event.clientY);
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'a,button,[role="button"],input,textarea,select,.link-premium,.btn-premium,.btn-premium-outline,.btn-whatsapp-premium',
      );
      setHovering(Boolean(interactive));
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[999] rounded-full border transition-[width,height,transform,opacity,box-shadow,background-color] duration-200 ${
        hovering
          ? "w-11 h-11 bg-primary/15 border-primary/60 shadow-[0_0_24px_rgba(249,115,22,0.55)]"
          : "w-7 h-7 bg-accent/10 border-accent/60 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
      } ${pressed ? "scale-75" : "scale-100"}`}
      style={{
        transform: `translate3d(${x - (hovering ? 22 : 14)}px, ${y - (hovering ? 22 : 14)}px, 0)`,
      }}
    />
  );
}
