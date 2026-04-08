import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { motion3D } from "@/lib/motion";

type ScrollStageProps = {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  mode?: "hinge" | "elegant";
};

export default function ScrollStage({
  children,
  className,
  direction = "left",
  mode = "hinge",
}: ScrollStageProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 88%", "end 20%"],
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
    stiffness: 130,
    damping: 24,
    mass: 0.65,
  });
  const sectionMotion =
    mode === "elegant"
      ? {
          rotateZ: motion3D.section.rotateZ * 0.45,
          rotateY: motion3D.section.rotateY * 0.55,
          rotateYExit: motion3D.section.rotateYExit * 0.45,
          rotateX: motion3D.section.rotateX * 0.5,
          rotateXExit: motion3D.section.rotateXExit * 0.4,
          y: motion3D.section.y * 0.55,
          yExit: motion3D.section.yExit * 0.45,
          scale: 0.95,
          scaleExit: 1.005,
        }
      : motion3D.section;

  const baseRotateZ = useTransform(
    scrollYProgress,
    [0, 0.22, 0.4, 0.68, 1],
    reduceMotion
      ? [0, 0, 0, 0, 0]
      : direction === "left"
        ? [-sectionMotion.rotateZ, -sectionMotion.rotateZ * 0.22, 0, 0, sectionMotion.rotateZ * 0.32]
        : [sectionMotion.rotateZ, sectionMotion.rotateZ * 0.22, 0, 0, -sectionMotion.rotateZ * 0.32],
  );
  const baseRotateY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.4, 0.68, 1],
    reduceMotion
      ? [0, 0, 0, 0, 0]
      : direction === "left"
        ? [sectionMotion.rotateY, sectionMotion.rotateY * 0.28, 0, 0, -sectionMotion.rotateYExit * 0.5]
        : [-sectionMotion.rotateY, -sectionMotion.rotateY * 0.28, 0, 0, sectionMotion.rotateYExit * 0.5],
  );
  const baseRotateX = useTransform(
    scrollYProgress,
    [0, 0.22, 0.4, 0.68, 1],
    reduceMotion ? [0, 0, 0, 0, 0] : [sectionMotion.rotateX, sectionMotion.rotateX * 0.3, 0, 0, -sectionMotion.rotateXExit * 0.45],
  );
  const baseY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.4, 0.68, 1],
    reduceMotion ? [0, 0, 0, 0, 0] : [sectionMotion.y, sectionMotion.y * 0.28, 0, 0, -sectionMotion.yExit * 0.45],
  );
  const baseScale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.4, 0.68, 1],
    reduceMotion ? [1, 1, 1, 1, 1] : [sectionMotion.scale, 0.992, 1, 1, 1.0006],
  );
  const rotateZ = useTransform(() => baseRotateZ.get() * easedActivity.get());
  const rotateY = useTransform(() => baseRotateY.get() * easedActivity.get());
  const rotateX = useTransform(() => baseRotateX.get() * easedActivity.get());
  const y = useTransform(() => baseY.get() * easedActivity.get());
  const scale = useTransform(() => 1 + (baseScale.get() - 1) * easedActivity.get());
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.14, 0.32, 1],
    mode === "elegant" ? [0.55, 0.9, 1, 1] : [0.38, 0.84, 1, 1],
  );
  const originX = direction === "left" ? "0%" : "100%";

  return (
    <motion.section
      ref={sectionRef}
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
    </motion.section>
  );
}
