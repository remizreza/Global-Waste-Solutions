import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import ScrollStage from "@/components/ScrollStage";
import ScrollTile from "@/components/ScrollTile";
import { contactDetails, pageLinks } from "@/lib/siteContent";
import { hingeReveal, premiumHoverLift, revealMask } from "@/lib/motion";

export default function Contact() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-spotlight opacity-55 pointer-events-none" />
        <div className="absolute inset-0 hero-architectural-grid opacity-15 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <ScrollStage className="mb-12" direction="right" mode="elegant">
          <motion.div
            className="page-hero-shell section-shell mb-12 rounded-[1.75rem] px-6 py-10 text-center sm:px-10"
            initial="hidden"
            animate="visible"
            variants={revealMask(28)}
          >
            <p className="section-label mb-5 text-sm">
              COMMERCIAL CONTACT & STRATEGY DESK
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Connect With REDOXY
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              For project discussions, strategic partnerships, and commercial coordination across KSA and UAE.
            </p>
          </motion.div>
          </ScrollStage>

          <ScrollStage className="grid gap-8 lg:grid-cols-12" direction="left" mode="elegant">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={hingeReveal("left", 28)}
              className="space-y-4 lg:col-span-5"
            >
              <ScrollTile direction="left">
              <div className="section-shell rounded-[1.5rem] p-6 brand-hover-lift">
                <p className="section-label mb-4 text-xs">Primary Channel</p>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                  Strategy Office
                </p>
                <p className="text-white text-lg">
                  {contactDetails.strategyOffice}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={contactDetails.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp-premium"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={contactDetails.mapsUAE}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
                  >
                    UAE Map
                  </a>
                  <a
                    href={contactDetails.mapsKSA}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
                  >
                    KSA Map
                  </a>
                </div>
              </div>
              </ScrollTile>
              <ScrollTile direction="right">
              <div className="section-shell rounded-[1.5rem] p-6">
                <p className="section-label mb-4 text-xs">Direct Lines</p>
                <p className="flex items-center gap-2 text-white mb-2">
                  <Phone className="w-4 h-4 text-primary" />{" "}
                  {contactDetails.phoneUAE}
                </p>
                <p className="flex items-center gap-2 text-white mb-2">
                  <Phone className="w-4 h-4 text-primary" />{" "}
                  {contactDetails.phoneKSA}
                </p>
                <p className="flex items-center gap-2 text-white mb-2">
                  <Mail className="w-4 h-4 text-primary" />{" "}
                  {contactDetails.email}
                </p>
                <p className="flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 text-primary" />{" "}
                  {contactDetails.website}
                </p>
              </div>
              </ScrollTile>
              <InfoPreviewDialog
                title="Engagement Channels"
                subtitle="How to engage REDOXY"
                points={[
                  "Technical projects: connect through KSA execution team.",
                  "Commercial/trading programs: connect through UAE hub.",
                  "Cross-border strategy and finance support through corporate office.",
                ]}
                ctaHref={pageLinks.services}
                ctaLabel="Review service lines"
                triggerLabel="Preview engagement map"
              />

              <ScrollTile direction="left">
              <div className="section-shell rounded-[1.5rem] p-6 brand-hover-lift">
                <p className="section-label mb-4 text-xs">Executive Office</p>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                  The Visionary
                </p>
                <h3 className="text-2xl text-white font-display mb-2">
                  Mr. Jawhar Adiyari, Founder & Industrialist Visionary
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Anchoring REDOXY’s leadership direction and high-impact industrial
                  growth strategy across KSA and UAE.
                </p>
                <Link href={pageLinks.contact} className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech">
                    Connect to Executive Office
                  </Link>
              </div>
              </ScrollTile>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={hingeReveal("right", 28)}
              whileHover={premiumHoverLift}
              className="section-shell rounded-[1.5rem] p-8 brand-hover-lift lg:col-span-7 lg:translate-y-10"
            >
              <p className="section-label mb-4 text-xs">Inquiry Form</p>
              <h2 className="text-2xl text-white font-display mb-5">
                Quick Inquiry
              </h2>
              <form
                className="space-y-4"
                action={`mailto:${contactDetails.email}`}
                method="post"
                encType="text/plain"
              >
                <input
                  className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
                  placeholder="Your Name"
                  name="name"
                />
                <input
                  className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
                  placeholder="Company"
                  name="company"
                />
                <input
                  className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
                  placeholder="Email"
                  name="email"
                  type="email"
                />
                <textarea
                  className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white min-h-[140px]"
                  placeholder="Project scope"
                  name="scope"
                />
                <button
                  className="btn-premium w-full"
                  type="submit"
                >
                  Send via Email
                </button>
              </form>
            </motion.div>
          </ScrollStage>

          <ScrollStage className="mt-10 grid gap-4 lg:grid-cols-12" direction="right" mode="elegant">
            <Link href={pageLinks.about} className="link-premium lg:col-span-4">
                View group structure
              </Link>
            <Link href={pageLinks.technology} className="link-premium lg:col-span-3 lg:translate-y-6">
                View technical methodology
              </Link>
            <Link href={pageLinks.traction} className="link-premium lg:col-span-5">
                View growth roadmap
              </Link>
          </ScrollStage>
        </div>
      </section>
    </SiteLayout>
  );
}
