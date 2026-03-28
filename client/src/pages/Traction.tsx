import { Link } from "wouter";
import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveStoriesBoard from "@/components/LiveStoriesBoard";
import LiveCommodityTicker from "@/components/LiveCommodityTicker";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import {
  pageLinks,
  tractionStorySlides,
  tractionContracts,
  tractionItems,
} from "@/lib/siteContent";
import { hingeReveal, premiumHoverLift, revealMask, staggerContainer } from "@/lib/motion";

export default function Traction() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
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
              PERFORMANCE & EXPANSION OUTLOOK
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Commercial Traction & Expansion Roadmap
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Current delivery signals, commercial milestones, and expansion targets through 2029 and beyond.
            </p>
            <p className="inline-flex mt-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-tech tracking-[0.18em] uppercase">
              REDOXY MTU 001 Strategic Highlight
            </p>
          </motion.div>
          </ScrollStage>

          <ScrollStage className="mb-10" direction="left">
          <div className="mb-10">
            <LiveCommodityTicker />
          </div>
          </ScrollStage>

          <ScrollStage className="mb-10" direction="right">
          <motion.div
            className="mb-10 grid gap-6 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={staggerContainer(0.12)}
          >
            {tractionItems.map((item, index) => (
              <ScrollTile
                key={item.title}
                direction={index % 2 === 0 ? "left" : "right"}
                className={index % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:translate-y-10"}
              >
              <motion.div
                key={item.title}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="section-shell rounded-[1.5rem] p-7 brand-hover-lift"
              >
                <p className="section-label mb-3 text-xs">Performance Signal</p>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                  {item.title}
                </p>
                <h2 className="text-3xl text-white font-display mb-2">
                  {item.metric}
                </h2>
                <p className="text-gray-300 text-sm mb-5">{item.subtitle}</p>
                <InfoPreviewDialog
                  title={item.title}
                  subtitle={item.subtitle}
                  points={item.details}
                  ctaHref={pageLinks.contact}
                  ctaLabel="Discuss strategy"
                />
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
          </ScrollStage>

          <ScrollStage className="" direction="left">
          <div className="section-shell rounded-[1.5rem] p-8">
            <p className="section-label mb-4 text-xs">Roadmap Window</p>
            <h3 className="text-2xl text-white font-display mb-4">
              Strategic Timeline
            </h3>
            <div className="grid gap-4 text-sm lg:grid-cols-12">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 lg:col-span-5">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2026-2027
                </p>
                <p className="text-gray-300">
                  Targeting new refinery partnerships and distribution hub
                  expansion.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 lg:col-span-3 lg:translate-y-8">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2028-2029
                </p>
                <p className="text-gray-300">
                  Scaling operations into selected Africa and Asia market
                  corridors.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 lg:col-span-4 lg:mt-16">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2030 Profit Target
                </p>
                <p className="text-gray-300">
                  Targeting 80% profit performance through scaled services,
                  recurring contracts, and cross-market trading execution.
                </p>
              </div>
            </div>
          </div>
          </ScrollStage>

          <ScrollStage className="mt-10 grid gap-6 lg:grid-cols-12" direction="right">
            {tractionContracts.map((contract, index) => (
              <ScrollTile
                key={contract.title}
                direction={index % 2 === 0 ? "left" : "right"}
                className={index === 0 ? "lg:col-span-4" : "lg:col-span-3 lg:translate-y-10"}
              >
              <motion.div
                key={contract.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 18)}
                whileHover={premiumHoverLift}
                className="section-shell rounded-[1.5rem] p-6"
              >
                <p className="section-label mb-2 text-xs">
                  New Contract
                </p>
                <h3 className="text-2xl font-display text-white mb-2">
                  {contract.title}
                </h3>
                <p className="text-orange-200 text-sm mb-4">{contract.subtitle}</p>
                <ul className="space-y-2 text-sm text-gray-200">
                  {contract.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="text-primary">▹</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              </ScrollTile>
            ))}
            <div className="lg:col-span-5">
              <LiveStoriesBoard
                fallbackTitle="Live Stories & Updates"
                fallbackSubtitle="If are interested to be part of our beautiful journey join hands with us, here is snap of what we ask for ...."
                fallbackSlides={tractionStorySlides}
                disableLiveFeed
              />
            </div>
          </ScrollStage>

          <ScrollStage className="mt-10 grid gap-4 lg:grid-cols-12" direction="left">
            <Link href={pageLinks.technology} className="link-premium lg:col-span-7">
                Review enabling technology
              </Link>
            <Link href={pageLinks.services} className="link-premium lg:col-span-5 lg:translate-y-8">
                Connect roadmap to service lines
              </Link>
          </ScrollStage>

          <p className="mt-6 text-sm text-gray-300">
            Technology insights power the live roadmap.{" "}
            <Link href={pageLinks.technology} className="text-primary underline">Explore the technology stack</Link>{" "}
            for the engineering behind each milestone.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
