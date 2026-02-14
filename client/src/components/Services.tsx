import { motion } from "framer-motion";
import modularUnit from "@/assets/modular-unit.png";
import { Check } from "lucide-react";

export default function Services() {
  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl opacity-50 rounded-full" />
              <img 
                src={modularUnit} 
                alt="Modular Treatment Unit" 
                className="relative z-10 w-full rounded-lg border border-white/10 shadow-2xl"
              />
              
              {/* Floating Tech Specs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-card border border-primary/30 p-4 rounded-lg shadow-xl backdrop-blur-md hidden md:block"
              >
                <div className="text-xs font-tech text-gray-400 uppercase tracking-widest mb-1">Deployment Time</div>
                <div className="text-2xl font-display text-primary font-bold">48 HOURS</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3 py-1 rounded-sm bg-primary/10 text-primary font-tech text-sm tracking-widest mb-4">
              OUR TECHNOLOGY
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
              MODULAR TREATMENT <span className="text-primary">UNITS (MTUs)</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 font-light leading-relaxed">
              Our competitive advantage lies in mobility. We deploy TPS (Tilted Plate Predictor) and Coalescing Separators that can be installed on-site within 48 hours, removing the need for massive permanent CAPEX for our clients.
            </p>

            <div className="space-y-4">
              {[
                "Rapid On-Site Deployment (48 Hours)",
                "Zero Permanent Infrastructure CAPEX",
                "High Efficiency Oil/Water Separation",
                "Remote Monitoring & Automated Control"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-300 font-sans">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="font-display text-white mb-2">Unit Economics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Payback Period</div>
                  <div className="text-xl font-bold text-white">5 Months</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Lifetime Profit</div>
                  <div className="text-xl font-bold text-primary">28.25M SAR</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
