import { motion } from "framer-motion";
import { Award, Briefcase, Truck, Recycle } from "lucide-react";

export default function Traction() {
  const milestones = [
    {
      partner: "Aramco",
      project: "Dammam Project Logistics",
      description: "Providing dedicated, specialized trucking and logistics support for operations in Dammam.",
      icon: <Truck className="w-6 h-6 text-primary" />,
      delay: 0.2
    },
    {
      partner: "Manarashada",
      project: "Oil Recycling Operations",
      description: "Executing comprehensive oil recycling contracts to transform industrial waste into valuable resources.",
      icon: <Recycle className="w-6 h-6 text-primary" />,
      delay: 0.4
    },
    {
      partner: "SABIC & Ma'aden",
      project: "Industrial Waste Solutions",
      description: "Trusted by the Kingdom's largest industrial players for highly professional waste treatment.",
      icon: <Briefcase className="w-6 h-6 text-primary" />,
      delay: 0.6
    },
    {
      partner: "RCYJ",
      project: "Royal Commission Approved",
      description: "Fully approved by the Royal Commission of Yanbu and Jubail for hazardous and non-hazardous treatment.",
      icon: <Award className="w-6 h-6 text-primary" />,
      delay: 0.8
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            PROVEN SUCCESS
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Traction</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-light">
            Setting new standards for waste management excellence alongside Saudi Arabia's most demanding industrial leaders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/5 border border-white/10 p-6 rounded-sm flex flex-col gap-4 group hover:border-primary/50 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="bg-background/80 p-3 rounded-full border border-white/5 shadow-[0_0_10px_rgba(20,184,166,0.1)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-shadow">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-wide">{item.partner}</h3>
                  <span className="text-primary text-sm font-tech tracking-wider">{item.project}</span>
                </div>
              </div>
              <p className="text-gray-400 font-sans font-light text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}