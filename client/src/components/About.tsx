import { motion } from "framer-motion";
import plantImg from "@/assets/redoxy/plant.jpg";

export default function About() {
  return (
    <section id="about" className="py-24 bg-secondary relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-tech text-primary tracking-widest uppercase mb-4">About Redoxy</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 uppercase">
              Leading <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sustainability</span>
            </h3>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              REDOXY-ITCC (Saudi Arabia) and its branch, REDOXY FZC (UAE), form a multidisciplinary group specializing in environmental services and sustainable waste management.
            </p>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Our mission is to revolutionize waste management in Saudi Arabia by providing innovative solutions that minimize environmental impact and transform waste into valuable resources.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-2">ISO</h4>
                <p className="text-sm font-tech text-primary uppercase tracking-wider">14001:2015 Certified</p>
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-2">GCC</h4>
                <p className="text-sm font-tech text-primary uppercase tracking-wider">Operational Footprint</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-video rounded-sm overflow-hidden border border-white/10 bg-white/5 relative shadow-2xl">
               <img src={plantImg} alt="Redoxy Industrial Plant" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 backdrop-blur-md border border-primary/30 z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-primary/20 z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
