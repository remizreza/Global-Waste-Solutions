import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type StorySlide = {
  id: string;
  title: string;
  description: string;
  image: string;
  mediaType?: "image" | "video" | "pdf";
  pdfPages?: number;
};

type StorySlideshowProps = {
  title: string;
  subtitle?: string;
  slides: StorySlide[];
};

export default function StorySlideshow({
  title,
  subtitle,
  slides,
}: StorySlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);

  useEffect(() => {
    if (slides.length < 2) return;

    const activeSlide = slides[activeIndex];
    const slideDuration = activeSlide?.mediaType === "video" ? 9000 : 4500;

    const intervalId = window.setInterval(() => {
      setPdfPage(1);
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, slideDuration);
    return () => window.clearInterval(intervalId);
  }, [activeIndex, slides]);

  useEffect(() => {
    setPdfPage(1);

    const activeSlide = slides[activeIndex];

    if (!activeSlide || activeSlide.mediaType !== "pdf") {
      return;
    }

    const totalPages = Math.max(1, activeSlide.pdfPages ?? 1);
    const intervalId = window.setInterval(() => {
      setPdfPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, slides]);

  if (slides.length === 0) return null;
  const active = slides[activeIndex];

  return (
    <section className="section-shell surface-editorial overflow-hidden rounded-[1.75rem]">
      <div className="border-b border-white/8 p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="section-label mb-2 text-[11px]">Story Film</p>
            <h3 className="text-[2rem] leading-none text-white font-display">{title}</h3>
          </div>
          <div className="hidden min-w-[10rem] md:block">
            <div className="h-[2px] w-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary via-white to-accent transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        {subtitle ? <p className="editorial-copy max-w-2xl text-sm">{subtitle}</p> : null}
      </div>
      <div className="relative">
        <div className="relative h-[280px] overflow-hidden md:h-[360px]">
          <AnimatePresence mode="wait">
            {active.mediaType === "video" ? (
              <motion.video
                key={active.id}
                src={active.image}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                autoPlay
                preload="auto"
                muted
                loop
                playsInline
                poster="/assets/hero-fallback.jpg"
              />
            ) : active.mediaType === "pdf" ? (
              <motion.object
                key={`${active.id}-${pdfPage}`}
                data={`${active.image}#page=${pdfPage}&view=FitH`}
                type="application/pdf"
                aria-label={active.title}
                className="absolute inset-0 h-full w-full bg-white"
                initial={{ opacity: 0, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="h-full w-full flex items-center justify-center bg-white/95 text-black text-sm px-4 text-center">
                  PDF preview is unavailable on this browser.
                  <a href={active.image} target="_blank" rel="noreferrer" className="underline font-semibold ml-1">
                    Open presentation
                  </a>
                </div>
              </motion.object>
            ) : (
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.title}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.55 }}
                loading="lazy"
              />
            )}
          </AnimatePresence>
          {active.mediaType === "pdf" ? null : (
            <div className="absolute inset-0 bg-gradient-to-t from-[#071022]/88 via-[#071022]/22 to-transparent" />
          )}
          <div className={`absolute left-0 right-0 p-5 md:p-6 ${active.mediaType === "pdf" ? "top-0" : "bottom-0"}`}>
            <p className="section-label mb-2 text-[11px]">
              Scene {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <h4 className={`mb-2 text-2xl md:text-3xl font-display ${active.mediaType === "pdf" ? "text-black" : "text-white"}`}>
              {active.title}
            </h4>
            <p className={`max-w-2xl text-sm leading-7 ${active.mediaType === "pdf" ? "text-black/80" : "text-gray-200"}`}>
              {active.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 bg-background/40 px-4 py-4">
          <div className="text-[11px] font-tech uppercase tracking-[0.22em] text-white/45">
            Curated Page Narrative
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => {
                setPdfPage(1);
                setActiveIndex(index);
              }}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-9 bg-primary"
                  : "w-2.5 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
