import { motion } from "framer-motion";
import { Link } from "wouter";
import { Factory, Recycle, Activity, Package, Settings, Zap, ArrowRight } from "lucide-react";

const services = [
  {
    icon: <Recycle className="w-10 h-10 text-primary" />,
    title: "Environmental Services",
    description: "Integrated solutions for sustainable waste management, following the 4R principle (Reduce, Reuse, Recycle, Recover)."
  },
  {
    icon: <Activity className="w-10 h-10 text-primary" />,
    title: "Wastewater Treatment",
    description: "Specialized onsite wastewater treatment solutions including MBR technology and evaporation systems."
  },
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: "Industrial Services",
    description: "Multidisciplinary technical services for Oil & Gas, Petrochemicals, and Power sectors."
  },
  {
    icon: <Package className="w-10 h-10 text-primary" />,
    title: "RENTAL OF EQUIPMENTS",
    description: "Comprehensive rental fleet of specialized industrial and environmental equipment for project requirements."
  },
  {
    icon: <Factory className="w-10 h-10 text-primary" />,
    title: "Specialty Chemicals",
    description: "Supply of industrial-grade chemicals and environmental treatment additives."
  },
  {
    icon: <Settings className="w-10 h-10 text-primary" />,
    title: "Consulting & Engineering",
    description: "Professional advisory for circular economy implementation and environmental compliance."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-tech text-primary tracking-widest uppercase mb-4">Our Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 uppercase">
              Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Offerings</span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
              Redoxy delivers integrated environmental and industrial solutions that drive efficiency and sustainability.
            </p>
            <Link href="/services">
              <a className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-black font-tech font-bold uppercase tracking-widest hover:bg-primary/90 transition-all group">
                View All Services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-8 rounded-sm border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="font-tech text-4xl font-bold text-white">0{index + 1}</div>
              </div>
              
              <div className="mb-6 p-4 bg-secondary rounded-full inline-block border border-white/10 group-hover:border-primary/50 transition-colors">
                {service.icon}
              </div>
              
              <h4 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary transition-colors uppercase">
                {service.title}
              </h4>
              
              <p className="text-gray-400 font-light leading-relaxed">
                {service.description}
              </p>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
