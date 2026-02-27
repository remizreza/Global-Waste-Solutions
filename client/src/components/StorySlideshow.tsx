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
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    const activeSlide = slides[activeIndex];
    if (!activeSlide || activeSlide.mediaType !== "pdf") {
      setPdfPage(1);
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
    <section className="border border-white/10 rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm">
      <div className="p-5 md:p-6 border-b border-white/10">
        <h3 className="text-2xl text-white font-display">{title}</h3>
        {subtitle ? <p className="text-gray-300 text-sm mt-1">{subtitle}</p> : null}
      </div>
      <div className="relative">
        <div className="h-[260px] md:h-[320px] relative overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
          )}
          <div className={`absolute left-0 right-0 p-5 md:p-6 ${active.mediaType === "pdf" ? "top-0" : "bottom-0"}`}>
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-tech mb-2">
              Live Story
            </p>
            <h4 className={`text-xl md:text-2xl font-display mb-2 ${active.mediaType === "pdf" ? "text-black" : "text-white"}`}>
              {active.title}
            </h4>
            <p className={`text-sm max-w-3xl ${active.mediaType === "pdf" ? "text-black/80" : "text-gray-200"}`}>
              {active.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-4 bg-background/60">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-9 bg-primary"
                  : "w-2.5 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
