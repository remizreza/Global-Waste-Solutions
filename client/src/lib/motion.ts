import type { TargetAndTransition, Variants } from "framer-motion";

export const MOTION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const motion3D = {
  perspective: 2200,
  section: {
    rotateZ: 0.8,
    rotateY: 12,
    rotateYExit: 4,
    rotateX: 6,
    rotateXExit: 2,
    y: 56,
    yExit: 16,
    scale: 0.97,
    scaleExit: 1.002,
  },
  tile: {
    rotateZ: 0.45,
    rotateY: 7,
    rotateYExit: 2,
    rotateX: 3,
    rotateXExit: 1,
    y: 28,
    yExit: 10,
    scale: 0.985,
    scaleExit: 1.001,
  },
} as const;

export const motionDuration = {
  micro: 0.18,
  ui: 0.28,
  section: 0.52,
  hero: 0.85,
  cinematic: 1.05,
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

export const revealMask = (distance = 36): Variants => ({
  hidden: {
    opacity: 0,
    y: distance * 0.65,
    clipPath: "inset(0 0 84% 0 round 24px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0 round 24px)",
    transition: {
      duration: motionDuration.cinematic,
      ease: MOTION_EASE,
    },
  },
});

export const hingeReveal = (direction: "left" | "right" = "left", distance = 24): Variants => ({
  hidden: {
    opacity: 0,
    y: distance * 0.7,
    rotateX: 4,
    rotateY: direction === "left" ? 7 : -7,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: motionDuration.section,
      ease: MOTION_EASE,
    },
  },
});

export const premiumHoverLift: TargetAndTransition = {
  y: -6,
  scale: 1.01,
  transition: { duration: motionDuration.micro, ease: MOTION_EASE },
};
