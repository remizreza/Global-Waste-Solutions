import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { motion3D } from "@/lib/motion";

type ScrollTileProps = {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
};

export default function ScrollTile({
  children,
  className,
  direction = "left",
}: ScrollTileProps) {
  const tileRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ["start 92%", "end 35%"],
  });

  useEffect(() => {
    if (reduceMotion) return;

    let stopTimer: number | null = null;
    const handleScroll = () => {
      setIsScrolling(true);
      if (stopTimer) {
        window.clearTimeout(stopTimer);
      }
      stopTimer = window.setTimeout(() => {
        setIsScrolling(false);
      }, 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimer) {
        window.clearTimeout(stopTimer);
      }
    };
  }, [reduceMotion]);

  const easedActivity = useSpring(reduceMotion ? 0 : isScrolling ? 1 : 0, {
    stiffness: 140,
    damping: 24,
    mass: 0.55,
  });
  const tileMotion = motion3D.tile;
  const baseRotateZ = useTransform(
    scrollYProgress,
    [0, 0.24, 0.42, 0.7, 1],
    reduceMotion
      ? [0, 0, 0, 0, 0]
      : direction === "left"
        ? [-tileMotion.rotateZ, -tileMotion.rotateZ * 0.18, 0, 0, tileMotion.rotateZ * 0.2]
        : [tileMotion.rotateZ, tileMotion.rotateZ * 0.18, 0, 0, -tileMotion.rotateZ * 0.2],
  );
  const baseRotateY = useTransform(
    scrollYProgress,
    [0, 0.24, 0.42, 0.7, 1],
    reduceMotion
      ? [0, 0, 0, 0, 0]
      : direction === "left"
        ? [tileMotion.rotateY, tileMotion.rotateY * 0.22, 0, 0, -tileMotion.rotateYExit * 0.45]
        : [-tileMotion.rotateY, -tileMotion.rotateY * 0.22, 0, 0, tileMotion.rotateYExit * 0.45],
  );
  const baseRotateX = useTransform(
    scrollYProgress,
    [0, 0.24, 0.42, 0.7, 1],
    reduceMotion ? [0, 0, 0, 0, 0] : [tileMotion.rotateX, tileMotion.rotateX * 0.22, 0, 0, -tileMotion.rotateXExit * 0.4],
  );
  const baseY = useTransform(
    scrollYProgress,
    [0, 0.24, 0.42, 0.7, 1],
    reduceMotion ? [0, 0, 0, 0, 0] : [tileMotion.y, tileMotion.y * 0.22, 0, 0, -tileMotion.yExit * 0.4],
  );
  const baseScale = useTransform(
    scrollYProgress,
    [0, 0.24, 0.42, 0.7, 1],
    reduceMotion ? [1, 1, 1, 1, 1] : [tileMotion.scale, 0.994, 1, 1, 1.0004],
  );
  const rotateZ = useTransform(() => baseRotateZ.get() * easedActivity.get());
  const rotateY = useTransform(() => baseRotateY.get() * easedActivity.get());
  const rotateX = useTransform(() => baseRotateX.get() * easedActivity.get());
  const y = useTransform(() => baseY.get() * easedActivity.get());
  const scale = useTransform(() => 1 + (baseScale.get() - 1) * easedActivity.get());
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.36, 1], [0.45, 0.88, 1, 1]);
  const originX = direction === "left" ? "0%" : "100%";

  return (
    <motion.div
      ref={tileRef}
      className={className}
      style={{
        rotateZ,
        rotateY,
        rotateX,
        y,
        scale,
        opacity,
        transformPerspective: motion3D.perspective,
        transformStyle: "preserve-3d",
        transformOrigin: `${originX} 50%`,
      }}
    >
      {children}
    </motion.div>
  );
}
