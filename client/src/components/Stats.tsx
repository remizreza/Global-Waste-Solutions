import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Globe, Activity } from "lucide-react";

const stats = [
  {
    label: "Net Profit Margin",
    value: "44.5%",
    icon: TrendingUp,
    desc: "Validated financial performance",
  },
  {
    label: "Market Opportunity",
    value: "1.2B SAR",
    icon: Globe,
    desc: "Industrial waste-to-value market in GCC",
  },
  {
    label: "Client Approval",
    value: "Tier 1",
    icon: ShieldCheck,
    desc: "Aramco, SABIC, Ma'aden Vendor Status",
  },
  {
    label: "Projected 2025 Profit",
    value: "3.3M SAR",
    icon: Activity,
    desc: "Strategic scale-up trajectory",
  },
];

export default function Stats() {
  return (
    <section className="py-20 bg-background border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group p-6 rounded-lg border border-white/10 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-tech text-primary uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
