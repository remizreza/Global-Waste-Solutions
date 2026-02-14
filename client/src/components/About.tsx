import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 bg-card border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            WHO WE ARE
          </h2>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            REDOXY operates under Innovative Technical Contracting Co. LLC in Saudi Arabia and is establishing REDOXY FZC in the UAE to facilitate regional oil trading. We are a "Ready-to-Contract" entity with full compliance in KSA's primary industrial zones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { 
              name: "Saudi Aramco", 
              role: "Vendor Approved", 
              desc: "Servicing the world's largest integrated energy and chemicals company." 
            },
            { 
              name: "SABIC", 
              role: "Vendor Approved", 
              desc: "Partnering with a global leader in diversified chemicals." 
            },
            { 
              name: "Ma'aden", 
              role: "Vendor Approved", 
              desc: "Supporting the champion of the Saudi Arabian mining industry." 
            }
          ].map((client, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-background border border-white/5 rounded-lg hover:border-primary/30 transition-colors group"
            >
              <div className="h-16 flex items-center justify-center mb-6">
                <span className="text-2xl font-display font-bold text-gray-500 group-hover:text-white transition-colors">
                  {client.name}
                </span>
              </div>
              <div className="text-primary font-tech text-sm uppercase tracking-widest mb-2">
                {client.role}
              </div>
              <p className="text-sm text-gray-500">
                {client.desc}
              </p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
           <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10">
             <span className="text-gray-400 font-tech text-sm">ROYAL COMMISSION APPROVED</span>
             <span className="w-1 h-4 bg-white/20"></span>
             <span className="text-gray-400 font-tech text-sm">JUBAIL & YANBU</span>
           </div>
        </div>
      </div>
    </section>
  );
}
