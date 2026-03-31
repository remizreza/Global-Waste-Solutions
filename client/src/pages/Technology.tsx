import { Link } from "wouter";
import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveStoriesBoard from "@/components/LiveStoriesBoard";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  pageLinks,
  rdAchievements,
  technologyStorySlides,
  technologyModules,
} from "@/lib/siteContent";
import { hingeReveal, premiumHoverLift, revealMask, staggerContainer } from "@/lib/motion";

export default function Technology() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="bg-video-smooth absolute inset-0 w-full h-full object-cover opacity-48"
            src="/assets/hero-bg-20260226-v2.mp4"
            preload="auto"
            muted
            loop
            playsInline
            autoPlay
            poster="/assets/hero-fallback.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/35 to-secondary/85" />
        </div>
        <div className="absolute inset-0 hero-spotlight opacity-55 pointer-events-none" />
        <div className="absolute inset-0 hero-architectural-grid opacity-15 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <ScrollStage className="mb-14" direction="right">
          <motion.div
            className="page-hero-shell section-shell mb-14 rounded-[1.75rem] px-6 py-10 text-center sm:px-10"
            initial="hidden"
            animate="visible"
            variants={revealMask(28)}
          >
            <p className="section-label mb-5 text-sm">
              ENGINEERING & PROCESS INTELLIGENCE
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Process Technology & Delivery Methods
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              The process systems, treatment methods, and operating intelligence that support REDOXY field execution.
            </p>
          </motion.div>
          </ScrollStage>

          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {technologyModules.map((module) => (
              <a
                key={module.id}
                href={`#tech-${module.id}`}
                className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
                data-premium-interactive
                data-premium-mode="magnetic"
              >
                {module.title}
              </a>
            ))}
            <a
              href="#tech-mtu"
              className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
              data-premium-interactive
              data-premium-mode="magnetic"
            >
              Modular Treatment Units (MTU)
            </a>
            <a
              href="#tech-advanced-recycling"
              className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
              data-premium-interactive
              data-premium-mode="magnetic"
            >
              Advanced Oil Recycling
            </a>
          </div>

          <ScrollStage className="mb-10" direction="left">
          <motion.div
            className="grid gap-6 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={staggerContainer(0.12)}
          >
            {technologyModules.map((module, index) => (
              <ScrollTile
                key={module.title}
                direction={index % 2 === 0 ? "left" : "right"}
                className={
                  index % 3 === 0
                    ? "lg:col-span-7"
                    : index % 3 === 1
                      ? "lg:col-span-5 lg:translate-y-10"
                      : "lg:col-span-6 lg:translate-y-4"
                }
              >
              <motion.div
                id={`tech-${module.id}`}
                key={module.title}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="section-shell flex flex-col rounded-[1.5rem] p-7"
                data-premium-interactive
                data-premium-mode="tilt"
              >
                <p className="section-label mb-4 text-xs">Module</p>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-2xl text-white font-display">
                    {module.title}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-xs uppercase tracking-[0.18em] text-primary font-tech"
                      >
                        (i)
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {module.id === "ro"
                        ? "Reverse Osmosis (RO) is an advanced water purification technology. It utilizes a semi-permeable membrane and high pressure to separate pure water molecules from impurities, effectively removing up to 99%+ of dissolved salts, particles, organics, and bacteria. It is critical for maximizing water reuse and meeting stringent industrial discharge regulations."
                        : module.summary}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-gray-300 text-sm mb-6 flex-1">
                  {module.summary}
                </p>
                <InfoPreviewDialog
                  title={module.title}
                  subtitle={module.summary}
                  points={module.details}
                  ctaHref={pageLinks.services}
                  ctaLabel="Back to Services"
                />
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
          </ScrollStage>

          <ScrollStage className="mt-10" direction="right">
          <div className="section-shell mt-10 rounded-[1.5rem] p-6 brand-hover-lift">
            <p className="section-label mb-4 text-xs">Research Proof</p>
            <h3 className="text-2xl text-white font-display mb-4">
              R&D Achievements
            </h3>
            <div className="grid gap-3 lg:grid-cols-12">
              {rdAchievements.map((item) => (
                <a
                  key={item}
                  href={pageLinks.services}
                  className="link-premium text-sm lg:col-span-6"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          </ScrollStage>

          <ScrollStage className="mt-10" direction="left">
          <div id="tech-mtu" className="section-shell mt-10 rounded-[1.5rem] p-6 brand-hover-lift">
            <p className="section-label mb-4 text-xs">Flagship Platform</p>
            <h3 className="text-2xl text-white font-display mb-3">
              Modular Treatment Units (MTU)
            </h3>
            <p className="text-gray-300 text-sm">
              Skid-mounted industrial wastewater and oil treatment units engineered
              for rapid deployment. MTUs combine compact process engineering with
              field-ready mobilization for compliant, high-throughput treatment.
            </p>
          </div>
          </ScrollStage>

          <ScrollStage className="mt-10" direction="right">
          <div id="tech-advanced-recycling" className="section-shell mt-10 rounded-[1.5rem] p-6 brand-hover-lift">
            <p className="section-label mb-4 text-xs">Recovery System</p>
            <h3 className="text-2xl text-white font-display mb-3">
              Advanced Oil Recycling
            </h3>
            <p className="text-gray-300 text-sm">
              State-of-the-art distillation and separation processes transforming
              industrial waste into market-ready commodities while maximizing
              recovery value and reducing disposal volumes.
            </p>
          </div>
          </ScrollStage>

          <ScrollStage className="mt-10" direction="left">
          <div className="section-shell mt-10 rounded-[1.5rem] overflow-hidden">
            <img
              src="/story-assets/network-connectivity.jpg"
              alt="Redoxy network connectivity map"
              className="w-full h-[250px] md:h-[320px] object-cover image-lift"
              loading="lazy"
            />
            <div className="p-5 md:p-6">
              <p className="section-label mb-3 text-xs">Regional Reach</p>
              <h3 className="text-xl md:text-2xl text-white font-display mb-2">
                Network Connectivity
              </h3>
              <p className="text-gray-300 text-sm">
                Integrated connectivity across KSA, UAE, and expansion corridors
                supports technical execution, logistics routing, and strategic
                industrial growth.
              </p>
            </div>
          </div>
          </ScrollStage>

          <ScrollStage className="mt-10" direction="right">
          <div className="mt-10">
            <LiveStoriesBoard
              fallbackTitle="Technology & R&D Story Stream"
              fallbackSubtitle="Upload new updates in /live-stories to publish automatically."
              fallbackSlides={technologyStorySlides}
              disableLiveFeed
            />
          </div>
          </ScrollStage>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <Link href={pageLinks.services} className="link-premium">
                See where each method is used in services
              </Link>
            <Link href={pageLinks.traction} className="link-premium">
                View how technology supports growth
              </Link>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            Traction metrics reflect applied engineering results.{" "}
            <Link href={pageLinks.traction} className="text-primary underline">See live traction data</Link>{" "}
            to connect R&D investment with commercial outcomes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
