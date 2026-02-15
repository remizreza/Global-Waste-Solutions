import { motion } from "framer-motion";
import { Factory, Recycle, Activity, Truck, Settings, Zap } from "lucide-react";

const services = [
  {
    icon: <Recycle className="w-10 h-10 text-primary" />,
    title: "Waste Processing",
    description: "Advanced sorting and processing facilities for industrial waste streams, maximizing material recovery."
  },
  {
    icon: <Factory className="w-10 h-10 text-primary" />,
    title: "Modular Infrastructure",
    description: "Rapidly deployable modular units for onsite waste treatment and energy generation."
  },
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: "Waste-to-Energy",
    description: "Converting non-recyclable waste into clean energy to power industrial operations."
  },
  {
    icon: <Activity className="w-10 h-10 text-primary" />,
    title: "Environmental Monitoring",
    description: "Real-time data analytics and reporting for environmental compliance and optimization."
  },
  {
    icon: <Truck className="w-10 h-10 text-primary" />,
    title: "Logistics Optimization",
    description: "Smart logistics solutions for efficient waste collection and material transport."
  },
  {
    icon: <Settings className="w-10 h-10 text-primary" />,
    title: "Consulting Services",
    description: "Expert advisory for circular economy implementation and sustainability strategies."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-tech text-primary tracking-widest uppercase mb-4">Our Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Solutions</span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Comprehensive services designed to transform industrial waste challenges into sustainable value.
            </p>
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
              className="group p-8 rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="font-tech text-4xl font-bold text-white">0{index + 1}</div>
              </div>
              
              <div className="mb-6 p-4 bg-black/50 rounded-full inline-block border border-white/10 group-hover:border-primary/50 transition-colors">
                {service.icon}
              </div>
              
              <h4 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h4>
              
              <p className="text-gray-400 font-light leading-relaxed">
                {service.description}
              </p>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
