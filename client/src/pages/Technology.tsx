import { Link } from "wouter";
import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveStoriesBoard from "@/components/LiveStoriesBoard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  pageLinks,
  rdAchievements,
  storySlides,
  technologyModules,
} from "@/lib/siteContent";

export default function Technology() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="bg-video-smooth absolute inset-0 w-full h-full object-cover opacity-48"
            src="/assets/Technology.mp4"
            preload="auto"
            muted
            loop
            playsInline
            autoPlay
            poster="/assets/hero-fallback.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/35 to-secondary/85" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-14">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              INNOVATION & METHODOLOGY
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Technology Stack
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Technical depth behind environmental treatment, precision
              industrial services, and digital operating intelligence.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {technologyModules.map((module) => (
              <a
                key={module.id}
                href={`#tech-${module.id}`}
                className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
              >
                {module.title}
              </a>
            ))}
            <a
              href="#tech-mtu"
              className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
            >
              Modular Treatment Units (MTU)
            </a>
            <a
              href="#tech-advanced-recycling"
              className="btn-premium-outline !px-3 !py-2 !text-[10px] !font-tech"
            >
              Advanced Oil Recycling
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {technologyModules.map((module) => (
              <motion.div
                id={`tech-${module.id}`}
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="border border-white/10 rounded-lg p-7 bg-card/50 flex flex-col backdrop-blur-sm"
              >
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
            ))}
          </div>

          <div className="mt-10 border border-white/10 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl text-white font-display mb-4">
              R&D Achievements
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {rdAchievements.map((item) => (
                <a
                  key={item}
                  href={pageLinks.services}
                  className="link-premium text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div id="tech-mtu" className="mt-10 border border-white/10 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl text-white font-display mb-3">
              Modular Treatment Units (MTU)
            </h3>
            <p className="text-gray-300 text-sm">
              Skid-mounted industrial wastewater and oil treatment units engineered
              for rapid deployment. MTUs combine compact process engineering with
              field-ready mobilization for compliant, high-throughput treatment.
            </p>
          </div>

          <div id="tech-advanced-recycling" className="mt-10 border border-white/10 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl text-white font-display mb-3">
              Advanced Oil Recycling
            </h3>
            <p className="text-gray-300 text-sm">
              State-of-the-art distillation and separation processes transforming
              industrial waste into market-ready commodities while maximizing
              recovery value and reducing disposal volumes.
            </p>
          </div>

          <div className="mt-10 border border-white/10 rounded-xl overflow-hidden bg-card/50">
            <img
              src="/story-assets/network-connectivity.jpg"
              alt="Redoxy network connectivity map"
              className="w-full h-[250px] md:h-[320px] object-cover"
              loading="lazy"
            />
            <div className="p-5 md:p-6">
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

          <div className="mt-10">
            <LiveStoriesBoard
              fallbackTitle="Technology & R&D Story Stream"
              fallbackSubtitle="Upload new updates in /live-stories to publish automatically."
              fallbackSlides={storySlides}
            />
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <Link href={pageLinks.services}>
              <a className="link-premium">
                See where each method is used in services
              </a>
            </Link>
            <Link href={pageLinks.traction}>
              <a className="link-premium">
                View how technology supports growth
              </a>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            Traction metrics reflect applied engineering results.{" "}
            <Link href={pageLinks.traction}>
              <a className="text-primary underline">See live traction data</a>
            </Link>{" "}
            to connect R&D investment with commercial outcomes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
