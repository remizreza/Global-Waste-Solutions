import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import QuickEnquiryDialog from "@/components/QuickEnquiryDialog";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import { revealMask, staggerContainer, hingeReveal, premiumHoverLift } from "@/lib/motion";

const tradingHubItems = [
  "Gas Oil",
  "Light Oils",
  "Naphtha",
  "Recovered Oil",
  "Oilfield Chemicals",
];

export default function Products() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-spotlight opacity-55 pointer-events-none" />
        <div className="absolute inset-0 hero-architectural-grid opacity-15 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <ScrollStage className="mb-14" direction="right">
          <motion.div
            className="section-shell relative mb-14 overflow-hidden rounded-[1.75rem] px-6 py-10 text-center sm:px-10"
            initial="hidden"
            animate="visible"
            variants={revealMask(28)}
          >
            <video
              className="bg-video-smooth absolute inset-0 h-full w-full object-cover opacity-26"
              src="/assets/products-port-bg-web.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,9,20,0.84),rgba(7,12,24,0.68)_45%,rgba(28,18,10,0.66))]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
            <div className="relative z-10">
            <p className="section-label mb-5 text-sm">
              TRADING & SUPPLY ACCESS
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              UAE Trading & Supply Desk
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Structured sourcing, supply coordination, and logistics support for strategic industrial commodities across GCC corridors.
            </p>
            </div>
          </motion.div>
          </ScrollStage>

          <ScrollStage className="" direction="left">
          <motion.div
            className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={staggerContainer(0.12)}
          >
            {tradingHubItems.map((item, index) => (
              <ScrollTile
                key={item}
                direction={index % 2 === 0 ? "left" : "right"}
                className={
                  index === 0
                    ? "lg:col-span-5"
                    : index === 1
                      ? "lg:col-span-3 lg:translate-y-10"
                      : index === 2
                        ? "lg:col-span-4"
                        : index === 3
                          ? "lg:col-span-4 lg:translate-y-8"
                          : "lg:col-span-8"
                }
              >
              <motion.div
                key={item}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="product-card section-shell rounded-[1.5rem] p-6"
              >
                <p className="section-label mb-4 text-xs">Trading Focus</p>
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  Trading Focus
                </p>
                <h2 className="text-2xl font-display text-white mb-3">{item}</h2>
                <p className="text-gray-300 text-sm">
                  High-velocity supply alignment for refinery and industrial
                  demand.
                </p>
                <div className="mt-4">
                  <QuickEnquiryDialog
                    productName={item}
                    triggerLabel="Quick Enquiry"
                  />
                </div>
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
          </ScrollStage>
        </div>
      </section>
    </SiteLayout>
  );
}
