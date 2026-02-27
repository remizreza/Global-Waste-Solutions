import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import LiveBulletinBoard from "@/components/LiveBulletinBoard";
import {
  homeStats,
  investmentCallout,
  pageLinks,
  serviceDivisions,
} from "@/lib/siteContent";
import aramcoLogo from "@/assets/logos/aramco.png";
import sabicLogo from "@/assets/logos/sabic.png";
import maadenLogo from "@/assets/logos/maaden.png";

export default function Home() {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const parallaxY = useTransform(scrollY, [0, 700], [0, 120]);

  return (
    <SiteLayout>
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#05070c]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="relative w-full max-w-7xl rounded-2xl overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.55)] border border-white/10 bg-black">
              <video
                className="bg-video-smooth w-full h-[80vh] md:h-[85vh] object-cover"
                src="/assets/hero-bg-20260226-v2.mp4?v=1"
                preload="auto"
                muted
                loop
                playsInline
                autoPlay
                poster="/assets/hero-fallback.jpg"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-[#05070c]/28" />
          <div className="hero-heat-haze absolute inset-0 mix-blend-soft-light opacity-45" />
          <div className="hero-noise absolute inset-0 opacity-18" />

          {!reduceMotion ? (
            <>
              <motion.div
                className="absolute left-[12%] top-[22%] h-32 w-32 rounded-full bg-orange-400/20 blur-2xl"
                animate={{ y: [0, -12, 0], x: [0, 12, 0], opacity: [0.4, 0.65, 0.4] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute right-[14%] bottom-[18%] h-40 w-40 rounded-full bg-blue-400/20 blur-3xl"
                animate={{ y: [0, 12, 0], x: [0, -10, 0], opacity: [0.33, 0.56, 0.33] }}
                transition={{ duration: 10.5, repeat: Infinity, ease: "linear" }}
              />
            </>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/52 via-secondary/24 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <motion.img
            src="/redoxy-icon.png"
            alt="REDOXY emblem"
            className="mx-auto mb-6 h-14 w-14 object-contain drop-shadow-[0_0_18px_rgba(249,115,22,0.45)]"
            initial={{ opacity: 0, scale: 0.75, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-6"
          >
            THE GLOBAL PARTNER
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-glitch text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6"
          >
            Sustainable Industrial & Energy Solutions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Integrated industrial, environmental, and trading services across
            GCC, Asia, and Africa.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={pageLinks.services}>
              <a className="btn-premium">
                Explore Our Services <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <Link href={pageLinks.about}>
              <a className="btn-premium-outline">
                Learn About The Group
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/10 bg-card/25">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <p className="text-xs font-tech uppercase tracking-[0.2em] text-primary mb-3">
            Investor Note
          </p>
          <h2 className="text-2xl md:text-3xl text-white font-display mb-3">
            {investmentCallout.headline}
          </h2>
          <p className="text-orange-200 font-tech uppercase tracking-[0.14em] mb-3">
            {investmentCallout.tagline}
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            {investmentCallout.summary}
          </p>
        </div>
      </section>

      <LiveBulletinBoard />

      <section className="py-14">
        <div className="container mx-auto px-6">
          <p className="text-xs font-tech uppercase tracking-[0.2em] text-primary text-center mb-6">
            Partner Ecosystem
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Saudi Aramco", logo: aramcoLogo },
              { name: "SABIC", logo: sabicLogo },
              { name: "Ma'aden", logo: maadenLogo },
            ].map((partner) => (
              <div
                key={partner.name}
                className="link-premium flex flex-col items-center justify-center py-6"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 object-contain mb-3"
                  loading="lazy"
                />
                <p className="text-white font-tech text-sm">{partner.name}</p>
                <p className="text-xs text-gray-400 mt-1">Vendor Engagement</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-white/10">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="bg-card/60 border border-white/10 p-8 rounded-lg backdrop-blur-sm"
          >
            <h2 className="text-3xl font-display text-white mb-4">
              Who We Are
            </h2>
            <p className="text-gray-300 leading-relaxed">
              REDOXY unifies two execution pillars: REDOXY-ITCC (KSA) for
              technical and environmental delivery, and REDOXY F.Z.C. (UAE) for
              agile trading and logistics.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="bg-card/60 border border-white/10 p-8 rounded-lg backdrop-blur-sm"
          >
            <h2 className="text-3xl font-display text-white mb-4">
              Integrated Value
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The model connects field capability, advanced treatment
              technology, and responsive commercial flow to deliver measurable
              industrial outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display text-white text-center mb-12">
            Our Core Services
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {serviceDivisions.map((division) => (
              <motion.div
                key={division.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -6 }}
                className="bg-card/60 border border-white/10 rounded-lg overflow-hidden flex flex-col backdrop-blur-sm"
              >
                <div className="aspect-video w-full bg-black/20">
                  <img
                    src={division.bgImage}
                    alt={division.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                    {division.entity}
                  </p>
                  <h3 className="text-xl font-display text-white mb-3">
                    {division.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-5 flex-1">
                    {division.summary}
                  </p>
                  <div className="flex items-center gap-3">
                    <InfoPreviewDialog
                      title={division.title}
                      subtitle={division.summary}
                      points={[...division.highlights, ...division.details]}
                      ctaHref={division.route}
                      ctaLabel="Open linked page"
                      triggerLabel="Preview"
                    />
                    <Link href={division.route}>
                      <a className="btn-premium-outline !px-3 !py-2 !text-xs !font-tech">
                        Go to section
                      </a>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-white/10 bg-card/30">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-display text-white mb-4">
              Commitment Highlight
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-2">
                <Leaf className="text-primary w-5 h-5" /> Net-Zero commitment by
                2050
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="text-primary w-5 h-5" /> ISO 14001
                certified environmental practices
              </p>
            </div>
            <Link href={pageLinks.technology}>
              <a className="btn-premium-outline mt-5 !px-4 !py-2 !text-xs !font-tech">
                See Our Technology
              </a>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {homeStats.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="border border-white/10 rounded-lg p-4 bg-background/60 backdrop-blur-sm"
              >
                <p className="text-2xl font-display text-white">{item.value}</p>
                <p className="text-primary text-xs font-tech uppercase tracking-wider mt-1">
                  {item.label}
                </p>
                <p className="text-gray-400 text-sm mt-2">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 text-center">
        <Link href={pageLinks.traction}>
          <a className="btn-premium">
            View Our Growth and Financial Outlook
          </a>
        </Link>
      </section>
    </SiteLayout>
  );
}
