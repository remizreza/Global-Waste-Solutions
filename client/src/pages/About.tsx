import { Building2, Compass, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import MilestoneStoryReel from "@/components/MilestoneStoryReel";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import {
  aboutValues,
  entityStructure,
  ownershipProfiles,
  pageLinks,
} from "@/lib/siteContent";
import { hingeReveal, premiumHoverLift, revealMask, staggerContainer } from "@/lib/motion";

export default function About() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-spotlight opacity-60 pointer-events-none" />
        <div className="absolute inset-0 hero-architectural-grid opacity-20 pointer-events-none" />
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
              GOVERNANCE, VALUES, STRUCTURE
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              The REDOXY Operating Group
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Two legal entities, one coordinated execution model, and one long-horizon industrial growth direction.
            </p>
          </motion.div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="left">
          <motion.div
            className="mb-12 grid gap-6 lg:grid-cols-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer(0.12)}
          >
            {entityStructure.map((entity, index) => (
              <ScrollTile
                key={entity.entity}
                direction={index % 2 === 0 ? "left" : "right"}
                className={index === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:translate-y-10"}
              >
              <motion.div
                key={entity.entity}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="section-shell rounded-[1.5rem] p-7 brand-hover-lift"
              >
                <p className="section-label mb-4 text-xs">Entity Profile</p>
                <h2 className="text-2xl text-white font-display mb-2">
                  {entity.entity}
                </h2>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mb-4">
                  Established {entity.established}
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  <strong className="text-white">Legal:</strong> {entity.legal}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Focus:</strong> {entity.focus}
                </p>
              </motion.div>
              </ScrollTile>
            ))}
          </motion.div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="right">
          <motion.div
            className="section-shell mb-12 rounded-[1.5rem] p-6 brand-hover-lift"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={revealMask(24)}
          >
            <p className="section-label mb-4 text-xs">Corporate Timeline</p>
            <h2 className="text-2xl text-white font-display mb-4">
              Partnership Timeline
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  2018
                </p>
                <p>
                  Founded in 2018 as SAAQ by Mr. Jawhar Adiyari, evolving into
                  the REDOXY corporate group.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  Today
                </p>
                <p>
                  Integrated KSA execution and UAE trading capabilities built
                  around modular treatment and industrial service expansion.
                </p>
              </div>
            </div>
          </motion.div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="left">
          <div className="mb-12">
            <p className="section-label mb-4 text-center text-xs">Execution Archive</p>
            <div className="page-section-heading">
              <h2 className="font-display">Selected Execution References</h2>
              <p>Illustrative delivery references and project snapshots that support operational credibility.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-12">
              {["KSA Recycling Project A", "KSA Recycling Project B", "KSA Recycling Project C"].map((item, index) => (
                <ScrollTile
                  key={item}
                  direction={index % 2 === 0 ? "left" : "right"}
                  className={
                    index === 0
                      ? "lg:col-span-5"
                      : index === 1
                        ? "lg:col-span-4 lg:translate-y-8"
                        : "lg:col-span-3"
                  }
                >
                <div
                  key={item}
                  className="section-shell rounded-[1.5rem] p-5 brand-hover-lift"
                >
                  <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                    Placeholder
                  </p>
                  <h3 className="text-lg text-white font-display mb-2">{item}</h3>
                  <p className="text-sm text-gray-300">
                    Project summary and client references to be added.
                  </p>
                </div>
                </ScrollTile>
              ))}
            </div>
          </div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="right">
          <div className="mb-12">
            <MilestoneStoryReel />
          </div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="left">
          <div className="mb-12 grid gap-6 lg:grid-cols-12">
            {aboutValues.map((value, index) => (
              <ScrollTile
                key={value.title}
                direction={index % 2 === 0 ? "left" : "right"}
                className={
                  index === 0
                    ? "lg:col-span-4"
                    : index === 1
                      ? "lg:col-span-5 lg:translate-y-8"
                      : "lg:col-span-3"
                }
              >
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                whileHover={premiumHoverLift}
                className="section-shell rounded-[1.5rem] p-6 brand-hover-lift"
              >
                <p className="section-label mb-4 text-xs">Core Value</p>
                <h3 className="text-xl font-display text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-sm mb-5">
                  {value.description}
                </p>
                <InfoPreviewDialog
                  title={value.title}
                  subtitle="REDOXY Core Value"
                  points={[value.description]}
                  ctaHref={pageLinks.contact}
                  ctaLabel="Discuss with our team"
                />
              </motion.div>
              </ScrollTile>
            ))}
          </div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="right">
          <div className="mb-12">
            <p className="section-label mb-4 text-center text-xs">Leadership</p>
            <h2 className="text-3xl text-white font-display mb-6 text-center">
              Our Leadership
            </h2>
            <div className="section-shell max-w-4xl mx-auto rounded-[1.5rem] p-6 brand-hover-lift">
              <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                Founder & Visionary
              </p>
              <h3 className="text-2xl text-white font-display mb-2">
                Mr. Jawhar Adiyari, Founder & Industrialist Visionary
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Driving REDOXY’s industrial strategy, modular treatment roadmap, and
                cross-border petrochemical trading vision.
              </p>
              <Link href={pageLinks.contact} className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech">
                  Contact Executive Office
                </Link>
            </div>
          </div>
          </ScrollStage>

          <ScrollStage className="mb-12" direction="left">
          <div className="mb-12">
            <p className="section-label mb-4 text-center text-xs">Ownership Matrix</p>
            <h2 className="text-3xl text-white font-display mb-6 text-center">
              Ownership & Leadership
            </h2>
            <div className="grid gap-6 lg:grid-cols-12">
              {ownershipProfiles.map((owner, index) => (
                <ScrollTile
                  key={owner.name}
                  direction={index % 2 === 0 ? "left" : "right"}
                  className={index === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:translate-y-10"}
                >
                <motion.div
                  key={owner.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={hingeReveal(index % 2 === 0 ? "left" : "right", 20)}
                  whileHover={premiumHoverLift}
                  className="section-shell rounded-[1.5rem] p-6 brand-hover-lift"
                >
                  <h3 className="text-2xl font-display text-white mb-2">
                    {owner.name}
                  </h3>
                  <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-3">
                    {owner.role}
                  </p>
                  <p className="text-gray-300 text-sm mb-2">
                    <strong className="text-white">Education:</strong>{" "}
                    {owner.education}
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    <strong className="text-white">Experience:</strong>{" "}
                    {owner.experience}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    {owner.highlights.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="text-primary">▹</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:${owner.email}`}
                    className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
                  >
                    Contact {owner.name.split(" ")[0]}
                  </a>
                </motion.div>
                </ScrollTile>
              ))}
            </div>
          </div>
          </ScrollStage>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href={pageLinks.services} className="link-premium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Linked Services
              </Link>
            <Link href={pageLinks.technology} className="link-premium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Technology
                Methodology
              </Link>
            <Link href={pageLinks.traction} className="link-premium flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Growth Outlook
              </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
