import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-industrial.png";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="REDOXY Modular Waste Treatment"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              EST. 2020 KSA • EST. 2025 REDOXY FZC UAE
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6">
              TRANSFORMING WASTE INTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400 text-glow">GLOBAL WEALTH</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 font-light font-sans">
              Deploying modular, innovative waste treatment units across the Kingdom. 
              <span className="font-semibold text-white"> Approved by the Royal Commission of Yanbu and Jubail. </span> 
              We recycle and treat hazardous and non-hazardous waste, connecting resources directly to the international market.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-background font-bold font-display uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
              >
                Partner With Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#technology"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-bold font-display uppercase tracking-wider rounded-sm hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                Our Modular Units
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
      >
        <span className="text-xs font-tech tracking-widest uppercase">
          Trusted by Aramco & SABIC
        </span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </motion.div>
    </section>
  );
}