import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import { contactDetails, pageLinks } from "@/lib/siteContent";

export default function Contact() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-12">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              CORPORATE STRATEGY & FINANCE
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Contact REDOXY Group
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              For partnerships, projects, and commercial collaboration across
              KSA and UAE.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="space-y-4"
            >
              <div className="border border-white/10 rounded-lg p-6 brand-surface brand-hover-lift">
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
              <div className="border border-white/10 rounded-lg p-6 bg-secondary/45">
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

              <div className="border border-white/10 rounded-lg p-6 brand-surface brand-hover-lift">
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
                <Link href={pageLinks.contact}>
                  <a className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech">
                    Connect to Executive Office
                  </a>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="border border-white/10 rounded-lg p-8 brand-surface brand-hover-lift"
            >
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
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <Link href={pageLinks.about}>
              <a className="link-premium">
                View group structure
              </a>
            </Link>
            <Link href={pageLinks.technology}>
              <a className="link-premium">
                View technical methodology
              </a>
            </Link>
            <Link href={pageLinks.traction}>
              <a className="link-premium">
                View growth roadmap
              </a>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
