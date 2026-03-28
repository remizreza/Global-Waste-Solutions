import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveBulletinBoard from "@/components/LiveBulletinBoard";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import {
  homeStats,
  investmentCallout,
  pageLinks,
  serviceDivisions,
} from "@/lib/siteContent";
import {
  fadeIn,
  hingeReveal,
  MOTION_EASE,
  motionDuration,
  premiumHoverLift,
  revealMask,
  scaleIn,
  staggerContainer,
} from "@/lib/motion";
import aramcoLogo from "@/assets/logos/aramco.png";
import sabicLogo from "@/assets/logos/sabic.png";
import maadenLogo from "@/assets/logos/maaden.png";
import type { MotionValue } from "framer-motion";

const heroHeading = "Sustainable Industrial & Energy Solutions".split(" ");
const heroTagline = "Integrated industrial, environmental, and trading services across GCC, Asia, and Africa".split(" ");
const heroVideoSrc = "/assets/hero-introduction.mp4";

function HeroTaglineWord({
  word,
  index,
  scrollYProgress,
  reduceMotion,
}: {
  word: string;
  index: number;
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = 0.18 + index * 0.03;
  const mid = start + 0.05;
  const end = start + 0.1;
  const opacity = useTransform(
    scrollYProgress,
    [start, mid, end],
    reduceMotion ? [1, 1, 1] : [0.08, 0.68, 1],
  );
  const translateY = useTransform(
    scrollYProgress,
    [start, end],
    reduceMotion ? [0, 0] : [18, 0],
  );
  const blur = useTransform(
    scrollYProgress,
    [start, end],
    reduceMotion ? [0, 0] : [10, 0],
  );
  const revealInset = useTransform(
    scrollYProgress,
    [start, end],
    reduceMotion ? [0, 0] : [100, 0],
  );
  const filter = useTransform(blur, (value) => `blur(${value}px)`);
  const clipPath = useTransform(revealInset, (value) => `inset(0 ${value}% 0 0)`);

  return (
    <motion.span
      className="mr-3 inline-block overflow-hidden last:mr-0"
      style={{ opacity, y: translateY, filter, clipPath }}
    >
      {word}
    </motion.span>
  );
}

function HeroHeadlineWord({
  word,
  index,
  active,
  reduceMotion,
}: {
  word: string;
  index: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      initial={{
        opacity: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 30,
        filter: reduceMotion ? "blur(0px)" : "blur(10px)",
        clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
      }}
      animate={
        active
          ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              clipPath: "inset(0 0% 0 0)",
            }
          : {
              opacity: reduceMotion ? 1 : 0,
              y: reduceMotion ? 0 : 30,
              filter: reduceMotion ? "blur(0px)" : "blur(10px)",
              clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            }
      }
      transition={{
        duration: reduceMotion ? 0.01 : 0.88,
        ease: MOTION_EASE,
        delay: reduceMotion ? 0 : 0.34 + index * 0.2,
      }}
      className="mr-3 inline-block overflow-hidden"
    >
      {word}
    </motion.span>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const preferInitialAudioRef = useRef(true);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [showVideoFallback, setShowVideoFallback] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const heroRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -14]);
  const heroLift = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -220]);
  const heroScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.02, 1.18]);
  const frameRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -7]);
  const frameY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 90]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -120]);
  const contentRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 3]);
  const spotlightRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 18]);
  const gridRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -10]);
  const hazeY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 140]);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 28]);
  const orbitScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.24]);
  const taglineBlockY = useTransform(scrollYProgress, [0.16, 0.34], reduceMotion ? [0, 0] : [18, 0]);
  const taglineBlockOpacity = useTransform(scrollYProgress, [0.14, 0.22, 0.38], reduceMotion ? [1, 1, 1] : [0, 0.75, 1]);
  const emblemBlockY = useTransform(scrollYProgress, [0, 0.08, 0.16], reduceMotion ? [0, 0, 0] : [42, 0, -8]);
  const emblemBlockOpacity = useTransform(scrollYProgress, [0, 0.04, 0.14, 0.24], reduceMotion ? [1, 1, 1, 1] : [0, 0.85, 1, 0.34]);
  const emblemBlockScale = useTransform(scrollYProgress, [0, 0.08, 0.16], reduceMotion ? [1, 1, 1] : [0.88, 1, 1.015]);
  const partnerTagY = useTransform(scrollYProgress, [0.04, 0.14, 0.26], reduceMotion ? [0, 0, 0] : [26, 0, -14]);
  const partnerTagOpacity = useTransform(scrollYProgress, [0.03, 0.1, 0.22, 0.3], reduceMotion ? [1, 1, 1, 1] : [0, 0.72, 1, 0.44]);
  const heroCardOpacity = useTransform(scrollYProgress, [0.16, 0.3, 0.48, 0.72], reduceMotion ? [1, 1, 1, 1] : [0.1, 0.72, 1, 0.82]);
  const heroCardY = useTransform(scrollYProgress, [0.16, 0.34, 0.72], reduceMotion ? [0, 0, 0] : [56, 0, -20]);
  const heroCardScale = useTransform(scrollYProgress, [0.16, 0.34, 0.72], reduceMotion ? [1, 1, 1] : [0.97, 1, 0.992]);
  const heroCardBlur = useTransform(scrollYProgress, [0.16, 0.34, 0.72], reduceMotion ? [0, 0, 0] : [10, 0, 3]);
  const heroCardFilter = useTransform(heroCardBlur, (value) => `blur(${value}px)`);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    const revealHeadline = () => {
      setHasVideoStarted(true);
    };

    let retryTimer: number | null = null;
    let interactionBound = false;

    const markFallback = () => {
      setShowVideoFallback(true);
      revealHeadline();
    };

    const attemptPlayback = async () => {
      if (document.visibilityState === "hidden") return;

      const shouldTryWithAudio = preferInitialAudioRef.current;

      video.muted = !shouldTryWithAudio;
      video.defaultMuted = !shouldTryWithAudio;
      video.volume = shouldTryWithAudio ? 1 : 0;
      video.loop = false;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      if (shouldTryWithAudio) {
        video.removeAttribute("muted");
      } else {
        video.setAttribute("muted", "");
      }
      video.removeAttribute("loop");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.controls = false;
      video.disablePictureInPicture = true;

      try {
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.currentTime === 0) {
          video.currentTime = 0.01;
        }
        await video.play();
        setShowVideoFallback(false);
      } catch {
        if (shouldTryWithAudio) {
          preferInitialAudioRef.current = false;
          video.muted = true;
          video.defaultMuted = true;
          video.volume = 0;
          video.setAttribute("muted", "");
          try {
            await video.play();
            setShowVideoFallback(false);
            return;
          } catch {
            // fall through to retry/fallback
          }
        }
        if (retryTimer) {
          window.clearTimeout(retryTimer);
        }
        retryTimer = window.setTimeout(() => {
          void video.play().catch(() => {
            markFallback();
          });
        }, 350);
      }
    };

    const handlePlaybackState = () => {
      const hasFrameReady = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
      const isActivelyPlaying = !video.paused && !video.ended;

      if (hasFrameReady || isActivelyPlaying) {
        revealHeadline();
      }
    };

    const handleEnded = () => {
      preferInitialAudioRef.current = false;
      video.currentTime = 0;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.setAttribute("muted", "");
      void video.play().catch(() => {
        markFallback();
      });
    };

    const playFromInteraction = () => {
      void attemptPlayback();
    };

    const bindInteractionFallback = () => {
      if (interactionBound) return;
      interactionBound = true;
      window.addEventListener("pointerdown", playFromInteraction, { passive: true });
      window.addEventListener("touchstart", playFromInteraction, { passive: true });
      window.addEventListener("keydown", playFromInteraction);
    };

    const unbindInteractionFallback = () => {
      if (!interactionBound) return;
      interactionBound = false;
      window.removeEventListener("pointerdown", playFromInteraction);
      window.removeEventListener("touchstart", playFromInteraction);
      window.removeEventListener("keydown", playFromInteraction);
    };

    video.addEventListener("loadeddata", handlePlaybackState);
    video.addEventListener("canplay", handlePlaybackState);
    video.addEventListener("canplaythrough", handlePlaybackState);
    video.addEventListener("playing", handlePlaybackState);
    video.addEventListener("playing", unbindInteractionFallback);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", markFallback);
    video.addEventListener("loadedmetadata", attemptPlayback);
    window.addEventListener("pageshow", attemptPlayback);
    document.addEventListener("visibilitychange", attemptPlayback);

    handlePlaybackState();
    bindInteractionFallback();
    void attemptPlayback();

    return () => {
      video.removeEventListener("loadeddata", handlePlaybackState);
      video.removeEventListener("canplay", handlePlaybackState);
      video.removeEventListener("canplaythrough", handlePlaybackState);
      video.removeEventListener("playing", handlePlaybackState);
      video.removeEventListener("playing", unbindInteractionFallback);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", markFallback);
      video.removeEventListener("loadedmetadata", attemptPlayback);
      window.removeEventListener("pageshow", attemptPlayback);
      document.removeEventListener("visibilitychange", attemptPlayback);
      unbindInteractionFallback();
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  return (
    <SiteLayout>
      <section ref={heroSectionRef} className="relative overflow-hidden bg-[#04070f] pb-18 pt-24">
        <div className="absolute inset-0 z-0">
          <motion.div className="hero-spotlight absolute inset-0 opacity-55" style={{ rotate: spotlightRotate, scale: heroScale }} />
          <motion.div className="hero-architectural-grid absolute inset-0 opacity-14" style={{ rotate: gridRotate, y: heroLift }} />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[18%] z-10 hidden h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/6 sm:block"
            style={{ rotate: orbitRotate, scale: orbitScale }}
          >
            <div className="absolute inset-5 rounded-full border border-primary/14" />
            <div className="absolute inset-12 rounded-full border border-accent/14" />
          </motion.div>
          <motion.div className="absolute inset-x-0 top-24 px-0 sm:px-4 lg:px-8" style={{ y: frameY, rotate: frameRotate }}>
            <motion.div className="hero-frame relative mx-auto w-full max-w-[1680px] overflow-hidden rounded-none border-y border-white/10 sm:rounded-[2rem] sm:border" style={{ rotate: heroRotate, scale: heroScale }}>
              <div className="pointer-events-none absolute inset-y-0 left-[9%] z-10 hidden w-px bg-white/25 sm:block" />
              <div className="hero-tower-line pointer-events-none absolute bottom-0 left-[9%] z-10 hidden h-[54%] w-px sm:block" />
              <div className="pointer-events-none absolute inset-y-0 right-[9%] z-10 hidden w-px bg-white/10 sm:block" />
              <video
                ref={heroVideoRef}
                className="bg-video-smooth w-full aspect-[16/8] object-cover contrast-[1.14] brightness-[1.18] saturate-[1.32]"
                src={heroVideoSrc}
                preload="auto"
                playsInline
                autoPlay
                poster="/assets/hero-fallback.jpg"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020611]/10 via-[#050d1e]/5 to-[#030712]/85" />
              {showVideoFallback ? (
                <button
                  type="button"
                  onClick={() => {
                    const video = heroVideoRef.current;
                    if (!video) return;
                    video.muted = false;
                    video.defaultMuted = false;
                    video.volume = 1;
                    preferInitialAudioRef.current = true;
                    void video.play().then(() => setShowVideoFallback(false));
                  }}
                  className="absolute inset-x-6 bottom-6 z-10 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-tech uppercase tracking-[0.24em] text-white backdrop-blur-sm"
                >
                  Start Hero Video
                </button>
              ) : null}
            </motion.div>
          </motion.div>
          <motion.div className="hero-heat-haze absolute inset-0 mix-blend-screen opacity-55" style={{ y: hazeY, rotate: spotlightRotate }} />
          <div className="hero-noise absolute inset-0 opacity-14" />

          {!reduceMotion ? (
            <>
              <motion.div
                className="absolute left-[12%] top-[22%] h-32 w-32 rounded-full bg-orange-400/20 blur-2xl"
                animate={{ y: [0, -12, 0], x: [0, 12, 0], opacity: [0.4, 0.65, 0.4] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute right-[14%] bottom-[18%] h-40 w-40 rounded-full bg-blue-400/20 blur-3xl"
                animate={{ y: [0, 12, 0], x: [0, -10, 0], opacity: [0.33, 0.56, 0.33] }}
                transition={{ duration: 10.5, repeat: Infinity, ease: "linear" }}
              />
            </>
          ) : null}
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.12, 0.14)}
          className="relative z-10 mx-auto flex min-h-[42rem] max-w-6xl flex-col items-center justify-start px-6 pb-18 pt-38 text-center sm:min-h-[46rem] sm:pt-42 md:min-h-[50rem] md:pt-46 lg:min-h-screen lg:pb-32 lg:pt-64"
          style={{ y: contentY, rotate: contentRotate }}
        >
          <motion.div
            variants={scaleIn(0.72)}
            className="relative mx-auto mb-6 flex w-fit flex-col items-center gap-4"
            style={{
              y: emblemBlockY,
              opacity: emblemBlockOpacity,
              scale: emblemBlockScale,
              willChange: reduceMotion ? undefined : "transform, opacity",
            }}
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-orange-500/45 blur-2xl" />
              <motion.img
                src="/redoxy-icon.png"
                alt="REDOXY emblem"
                className="relative mx-auto h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-[0_0_28px_rgba(255,122,0,0.8)]"
                style={{
                  opacity: emblemBlockOpacity,
                  scale: emblemBlockScale,
                  y: emblemBlockY,
                }}
              />
            </div>
            <motion.p
              style={{
                y: partnerTagY,
                opacity: partnerTagOpacity,
              }}
              className="rounded-full border border-white/20 bg-black/30 px-5 py-2 text-[11px] font-tech uppercase tracking-[0.42em] text-white shadow-[0_0_28px_rgba(0,0,0,0.28)] backdrop-blur-sm md:text-xs"
            >
              THE GLOBAL PARTNER
            </motion.p>
          </motion.div>
          <motion.div
            variants={revealMask(42)}
            className="page-hero-shell section-shell surface-hero mt-18 mb-8 w-full max-w-[46rem] rounded-[1.75rem] px-5 py-7 sm:mt-22 sm:max-w-[52rem] sm:px-7 sm:py-8 md:mt-26 md:max-w-[42rem] md:px-8 md:py-8 lg:mt-36 lg:max-w-[72rem] lg:px-10 lg:py-10"
            style={{
              opacity: heroCardOpacity,
              y: heroCardY,
              scale: heroCardScale,
              filter: heroCardFilter,
            }}
          >
            <motion.div className="mb-4 overflow-hidden" style={{ y: taglineBlockY, opacity: taglineBlockOpacity }}>
              <p className="section-label text-[10px] sm:text-[11px] lg:text-xs">
                {heroTagline.map((word, index) => {
                  return (
                    <HeroTaglineWord
                      key={`${word}-${index}`}
                      word={word}
                      index={index}
                      scrollYProgress={scrollYProgress}
                      reduceMotion={!!reduceMotion}
                    />
                  );
                })}
              </p>
            </motion.div>
            <motion.h1 className="mx-auto mb-4 max-w-[14ch] text-balance text-[2.35rem] font-display font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-[2.8rem] md:max-w-[12ch] md:text-[3.35rem] lg:mb-5 lg:max-w-[16ch] lg:text-[4.6rem]">
              {heroHeading.map((word, index) => (
                <HeroHeadlineWord
                  key={`${word}-${index}`}
                  word={word}
                  index={index}
                  active={!!reduceMotion || hasVideoStarted}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.95,
                delay: reduceMotion ? 0 : 1.55,
                ease: MOTION_EASE,
              }}
              className="editorial-copy mx-auto mb-7 max-w-2xl text-[0.98rem] sm:text-base md:max-w-[34rem] md:text-[1rem] lg:mb-8 lg:max-w-3xl lg:text-[1.05rem]"
            >
              Integrated industrial, environmental, and trading services across GCC, Asia, and Africa.
            </motion.p>
            <div className="premium-divider mb-6 lg:mb-8" />
            <motion.div variants={fadeIn} className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href={pageLinks.services} className="btn-premium magnetic-button" data-premium-interactive data-premium-mode="magnetic">
                Explore Our Services <ArrowRight className="w-4 h-4" />
              </Link>
            <Link href={pageLinks.about} 
                className="btn-premium-outline magnetic-button"
                data-premium-interactive
                data-premium-mode="magnetic">
                Learn About The Group
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <ScrollStage
        className="border-y border-white/10 bg-card/25 py-14"
        direction="right"
      >
        <motion.div
          className="container mx-auto max-w-5xl px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={revealMask(24)}
        >
          <div className="section-shell rounded-[1.5rem] px-6 py-10 sm:px-10">
          <p className="section-label mb-3 text-xs">
            Investor Note
          </p>
          <h2 className="mb-3 text-2xl font-display text-white md:text-3xl">
            {investmentCallout.headline}
          </h2>
          <p className="mb-3 font-tech uppercase tracking-[0.14em] text-orange-200">
            {investmentCallout.tagline}
          </p>
          <p className="text-sm text-gray-300 md:text-base">
            {investmentCallout.summary}
          </p>
          </div>
        </motion.div>
      </ScrollStage>

      <LiveBulletinBoard />

      <ScrollStage className="architectural-rail py-16" direction="left" mode="elegant">
        <div className="container mx-auto px-6">
          <div className="page-section-heading">
            <p className="section-label mb-4 text-xs">Partner Ecosystem</p>
            <h2 className="font-display">Aligned With Industrial Majors</h2>
            <p>Structured relationships that support credibility, procurement access, and execution confidence.</p>
          </div>
          <motion.div
            className="grid items-start gap-4 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerContainer(0.1)}
          >
            {[
              { name: "Saudi Aramco", logo: aramcoLogo },
              { name: "SABIC", logo: sabicLogo },
              { name: "Ma'aden", logo: maadenLogo },
            ].map((partner, index) => (
              <ScrollTile
                key={partner.name}
                direction={index % 2 === 0 ? "left" : "right"}
                className={index === 1 ? "lg:col-span-5 lg:translate-y-8" : "lg:col-span-3"}
              >
              <motion.div
                key={partner.name}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 16)}
                whileHover={premiumHoverLift}
                className="section-shell premium-card flex flex-col items-center justify-center rounded-[1.5rem] px-6 py-8 text-center"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 object-contain mb-3"
                  loading="lazy"
                />
                <p className="text-white font-tech text-sm">{partner.name}</p>
                <p className="text-xs text-gray-400 mt-1">Vendor Engagement</p>
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
        </div>
      </ScrollStage>

      <ScrollStage className="architectural-rail border-y border-white/8 py-24" direction="right" mode="elegant">
        <motion.div
          className="container mx-auto grid gap-8 px-6 lg:grid-cols-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer(0.12)}
        >
          <motion.div
            variants={revealMask(20)}
            className="section-shell surface-editorial rounded-[1.5rem] p-8 lg:col-span-7 lg:pr-18"
          >
            <p className="section-label mb-4 text-xs">Identity</p>
            <h2 className="mb-4 text-3xl font-display text-white">Who We Are</h2>
            <p className="text-gray-300 leading-relaxed">
              REDOXY unifies two execution pillars: REDOXY-ITCC (KSA) for technical and environmental delivery, and
              REDOXY F.Z.C. (UAE) for agile trading and logistics.
            </p>
          </motion.div>
          <motion.div
            variants={revealMask(20)}
            className="section-shell surface-editorial rounded-[1.5rem] p-8 lg:col-span-5 lg:translate-y-10"
          >
            <p className="section-label mb-4 text-xs">Delivery Logic</p>
            <h2 className="mb-4 text-3xl font-display text-white">Integrated Value</h2>
            <p className="text-gray-300 leading-relaxed">
              The model connects field capability, advanced treatment technology, and responsive commercial flow to
              deliver measurable industrial outcomes.
            </p>
          </motion.div>
        </motion.div>
      </ScrollStage>

      <ScrollStage className="architectural-rail py-24" direction="left" mode="elegant">
        <div className="container mx-auto px-6">
          <div className="page-section-heading">
            <p className="section-label mb-4 text-xs">Core Programs</p>
            <h2 className="font-display">Our Core Services</h2>
            <p>Distinct operating pillars presented through one integrated, investor-ready service architecture.</p>
          </div>
          <motion.div
            className="grid items-start gap-6 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer(0.12)}
          >
            {serviceDivisions.map((division, index) => (
              <ScrollTile
                key={division.id}
                direction={index % 2 === 0 ? "left" : "right"}
                className={
                  index === 0
                    ? "lg:col-span-5"
                    : index === 1
                      ? "lg:col-span-4 lg:translate-y-8"
                      : "lg:col-span-3"
                }
              >
              <motion.div
                key={division.id}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="section-shell surface-editorial premium-card flex h-auto flex-col overflow-hidden rounded-[1.5rem]"
                data-premium-interactive
                data-premium-mode="tilt"
              >
                <div className="aspect-video w-full bg-secondary/35 overflow-hidden">
                  <img
                    src={division.bgImage}
                    alt={division.title}
                    className="w-full h-full object-cover image-lift"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                    {division.entity}
                  </p>
                  <p className="section-label mb-3 text-[10px]">Execution Division</p>
                  <h3 className="text-xl font-display text-white mb-3">{division.title}</h3>
                  <p className="text-gray-300 text-sm mb-5 flex-1">{division.summary}</p>
                  <div className="flex items-center gap-3">
                    <InfoPreviewDialog
                      title={division.title}
                      subtitle={division.summary}
                      points={[...division.highlights, ...division.details]}
                      ctaHref={division.route}
                      ctaLabel="Open linked page"
                      triggerLabel="Preview"
                    />
                    <Link href={division.route} className="btn-premium-outline !px-3 !py-2 !text-xs !font-tech">Go to section</Link>
                  </div>
                </div>
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
        </div>
      </ScrollStage>

      <ScrollStage className="border-y border-white/8 bg-card/20 py-18" direction="right" mode="elegant">
        <div className="container mx-auto grid items-start gap-8 px-6 lg:grid-cols-12">
          <motion.div variants={revealMask(24)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="section-shell surface-editorial rounded-[1.5rem] p-8 lg:col-span-5 lg:sticky lg:top-28">
            <p className="section-label mb-4 text-xs">Long-Term Positioning</p>
            <h3 className="mb-4 text-2xl font-display text-white">Commitment Highlight</h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-2">
                <Leaf className="text-primary w-5 h-5" /> Net-Zero commitment by 2050
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="text-primary w-5 h-5" /> ISO 14001 certified environmental practices
              </p>
            </div>
            <Link href={pageLinks.technology} className="btn-premium-outline mt-5 !px-4 !py-2 !text-xs !font-tech magnetic-button">
                See Our Technology
              </Link>
          </motion.div>
          <motion.div
            className="grid items-start gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer(0.08)}
          >
            {homeStats.map((item, index) => (
              <ScrollTile
                key={item.label}
                direction={index % 2 === 0 ? "left" : "right"}
                className={
                  index === 0
                    ? "lg:col-span-7"
                    : index === 1
                      ? "lg:col-span-5 lg:translate-y-8"
                      : index === 2
                        ? "lg:col-span-5"
                        : "lg:col-span-7 lg:-translate-y-6"
                }
              >
              <motion.div
                key={item.label}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 16)}
                whileHover={premiumHoverLift}
                className="section-shell surface-utility premium-card rounded-[1.25rem] p-5"
              >
                <p className="text-2xl font-display text-white">{item.value}</p>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mt-1">
                  {item.label}
                </p>
                <p className="text-gray-400 text-sm mt-2">{item.description}</p>
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
        </div>
      </ScrollStage>

      <ScrollStage className="py-18 text-center" direction="left" mode="elegant">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="section-shell rounded-[1.75rem] px-6 py-10 sm:px-10">
            <p className="section-label mb-4 text-xs">Next Layer</p>
            <h2 className="mb-4 font-display text-3xl text-white md:text-4xl">Review Growth, Roadmap, and Commercial Scale</h2>
            <p className="mx-auto mb-8 max-w-2xl text-sm text-gray-300 md:text-base">
              Continue through the connected REDOXY narrative to understand how capability converts into traction and strategic expansion.
            </p>
            <Link href={pageLinks.traction} className="btn-premium magnetic-button" data-premium-interactive data-premium-mode="magnetic">
              View Our Growth and Financial Outlook
            </Link>
          </div>
        </div>
      </ScrollStage>
    </SiteLayout>
  );
}
