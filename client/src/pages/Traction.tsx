import { Link } from "wouter";
import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveStoriesBoard from "@/components/LiveStoriesBoard";
import LiveCommodityTicker from "@/components/LiveCommodityTicker";
import {
  pageLinks,
  storySlides,
  tractionContracts,
  tractionItems,
} from "@/lib/siteContent";

export default function Traction() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-14">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              GROWTH & FINANCIAL OUTLOOK
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Traction and Strategic Roadmap
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Demonstrating current performance and forward expansion targets
              through 2029 and beyond.
            </p>
            <p className="inline-flex mt-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-tech tracking-[0.18em] uppercase">
              REDOXY MTU 001 Strategic Highlight
            </p>
          </div>

          <div className="mb-10">
            <LiveCommodityTicker />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {tractionItems.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="border border-white/10 rounded-lg p-7 bg-card/50 backdrop-blur-sm"
              >
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
            ))}
          </div>

          <div className="bg-card/50 border border-white/10 rounded-lg p-8">
            <h3 className="text-2xl text-white font-display mb-4">
              Strategic Timeline
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2026-2027
                </p>
                <p className="text-gray-300">
                  Targeting new refinery partnerships and distribution hub
                  expansion.
                </p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2028-2029
                </p>
                <p className="text-gray-300">
                  Scaling operations into selected Africa and Asia market
                  corridors.
                </p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-primary font-tech uppercase text-xs mb-2">
                  2035 Vision
                </p>
                <p className="text-gray-300">
                  Targeting 50% of revenue from new energy ventures (Green
                  Hydrogen, SAF, CCS).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            {tractionContracts.map((contract) => (
              <motion.div
                key={contract.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                className="border border-primary/30 rounded-lg p-6 bg-primary/10"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-tech mb-2">
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
            ))}
            <LiveStoriesBoard
              fallbackTitle="Project Stories & Announcements"
              fallbackSubtitle="Update /live-stories/stories.json and upload media to publish new stories automatically."
              fallbackSlides={storySlides}
            />
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <Link href={pageLinks.technology}>
              <a className="link-premium">
                Review enabling technology
              </a>
            </Link>
            <Link href={pageLinks.services}>
              <a className="link-premium">
                Connect roadmap to service lines
              </a>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            Technology insights power the live roadmap.{" "}
            <Link href={pageLinks.technology}>
              <a className="text-primary underline">Explore the technology stack</a>
            </Link>{" "}
            for the engineering behind each milestone.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
