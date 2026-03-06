import type { TargetAndTransition, Variants } from "framer-motion";

export const MOTION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const motionDuration = {
  micro: 0.18,
  ui: 0.32,
  section: 0.64,
  hero: 1.0,
} as const;

export const staggerContainer = (stagger = 0.12, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren,
      ease: MOTION_EASE,
    },
  },
});

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionDuration.ui, ease: MOTION_EASE },
  },
};

export const fadeUp = (distance = 24): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.section, ease: MOTION_EASE },
  },
});

export const slideIn = (axis: "x" | "y" = "x", distance = 28): Variants => ({
  hidden: { opacity: 0, [axis]: distance },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: motionDuration.section, ease: MOTION_EASE },
  },
});

export const scaleIn = (from = 0.94): Variants => ({
  hidden: { opacity: 0, scale: from },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionDuration.ui, ease: MOTION_EASE },
  },
});

export const hoverElevation: TargetAndTransition = {
  y: -6,
  scale: 1.01,
  transition: { duration: motionDuration.micro, ease: MOTION_EASE },
};
