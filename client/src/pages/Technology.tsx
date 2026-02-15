import { motion } from "framer-motion";
import { Cpu, Zap, Filter, Beaker } from "lucide-react";

export default function Technology() {
  const techFeatures = [
    {
      title: "Modular Treatment Units",
      description: "Deployable, scalable, and highly efficient modular infrastructure designed to treat industrial waste directly at the source.",
      icon: <Cpu className="w-8 h-8 text-primary" />
    },
    {
      title: "Reverse Osmosis & Evaporation",
      description: "State-of-the-art vacuum evaporation and RO systems designed for complex industrial wastewater recovery.",
      icon: <Filter className="w-8 h-8 text-primary" />
    },
    {
      title: "Advanced Chemical Oxidation",
      description: "Utilizing powerful oxidation processes to break down hazardous compounds safely and efficiently.",
      icon: <Beaker className="w-8 h-8 text-primary" />
    },
    {
      title: "Electro-Oxidation",
      description: "Cutting-edge electrical processes for the destruction of persistent organic pollutants in industrial effluent.",
      icon: <Zap className="w-8 h-8 text-primary" />
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            INNOVATION ENGINE
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Technology</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-light">
            We stay ahead by adopting the latest technologies in waste reduction, leveraging cutting-edge equipment for complex petrochemical and industrial challenges.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techFeatures.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white/5 border border-white/10 p-8 rounded-sm hover:border-primary/50 transition-all group backdrop-blur-sm"
            >
              <div className="mb-6 bg-background/50 inline-block p-4 rounded-full border border-white/5 shadow-[0_0_15px_rgba(20,184,166,0.1)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                {tech.icon}
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider">
                {tech.title}
              </h3>
              <p className="text-gray-400 font-sans font-light leading-relaxed">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}