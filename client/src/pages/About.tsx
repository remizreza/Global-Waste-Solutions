import { Building2, Compass, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import MilestoneStoryReel from "@/components/MilestoneStoryReel";
import {
  aboutValues,
  entityStructure,
  ownershipProfiles,
  pageLinks,
} from "@/lib/siteContent";

export default function About() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-14">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              PEOPLE, VALUES, STRUCTURE
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              About REDOXY Group
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Two legal entities, one integrated execution model, and one
              long-term sustainability direction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {entityStructure.map((entity) => (
              <motion.div
                key={entity.entity}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="border border-white/10 rounded-lg p-7 bg-card/50 backdrop-blur-sm"
              >
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
            ))}
          </div>

          <div className="border border-white/10 rounded-xl p-6 bg-card/50 backdrop-blur-sm mb-12">
            <h2 className="text-2xl text-white font-display mb-4">
              Partnership Timeline
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  2018
                </p>
                <p>
                  Founded in 2018 as SAAQ by Mr. Jawhar Adiyari, evolving into
                  the REDOXY corporate group.
                </p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  Today
                </p>
                <p>
                  Integrated KSA execution and UAE trading capabilities built
                  around modular treatment and industrial service expansion.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl text-white font-display mb-6 text-center">
              Previous Works Executed
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {["KSA Recycling Project A", "KSA Recycling Project B", "KSA Recycling Project C"].map((item) => (
                <div
                  key={item}
                  className="border border-white/10 rounded-lg p-5 bg-card/50 backdrop-blur-sm"
                >
                  <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                    Placeholder
                  </p>
                  <h3 className="text-lg text-white font-display mb-2">{item}</h3>
                  <p className="text-sm text-gray-300">
                    Project summary and client references to be added.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <MilestoneStoryReel />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {aboutValues.map((value) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="border border-white/10 rounded-lg p-6 bg-card/50 backdrop-blur-sm"
              >
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
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-3xl text-white font-display mb-6 text-center">
              Our Leadership
            </h2>
            <div className="border border-white/10 rounded-xl p-6 bg-card/50 backdrop-blur-sm max-w-4xl mx-auto">
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
              <Link href={pageLinks.contact}>
                <a className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech">
                  Contact Executive Office
                </a>
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl text-white font-display mb-6 text-center">
              Ownership & Leadership
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {ownershipProfiles.map((owner) => (
                <motion.div
                  key={owner.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45 }}
                  whileHover={{ y: -4 }}
                  className="border border-white/10 rounded-lg p-6 bg-card/50 backdrop-blur-sm"
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
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href={pageLinks.services}>
              <a className="link-premium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Linked Services
              </a>
            </Link>
            <Link href={pageLinks.technology}>
              <a className="link-premium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Technology
                Methodology
              </a>
            </Link>
            <Link href={pageLinks.traction}>
              <a className="link-premium flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Growth Outlook
              </a>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
