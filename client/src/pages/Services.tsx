import { motion } from "framer-motion";
import { Droplets, Factory, Wrench } from "lucide-react";

export default function Services() {
  // We organized your brochure data into three clean categories!
  const serviceCategories = [
    {
      title: "Waste Water & Environmental",
      icon: <Droplets className="w-8 h-8 text-primary" />,
      items: [
        "Advanced chemical oxidation",
        "Reverse Osmosis & Vacuum Evaporation",
        "Electro oxidation",
        "Oil and sludge treatment",
        "Hazardous waste handling, transportation & cleaning",
        "Industrial waste water evaporation",
        "Dewatering services",
        "Tank and pond cleaning & sludge removal"
      ]
    },
    {
      title: "Industrial Services",
      icon: <Factory className="w-8 h-8 text-primary" />,
      items: [
        "Chemical Cleaning (Boilers, reactors, exchangers, pipelines)",
        "Blasting & Painting of Pipelines and Storage Tanks (API standard)",
        "Hydro milling & hydro jetting (pipelines, trenches, pits)",
        "Steam tracing for oil pipelines",
        "Repair & Crude oil washing of Tanks & Silos",
        "Hydraulic Bolt torquing, tensioning, and On-site Machining",
        "Fabrication, installation & Maintenance of static/rotary equipment"
      ]
    },
    {
      title: "Support & Logistics",
      icon: <Wrench className="w-8 h-8 text-primary" />,
      items: [
        "Equipment Rental (pumps, compressors, generators, boilers, etc.)",
        "Media replacement (loading and unloading)",
        "Logistic services (road tank, vacuum tank, super sucker, flat bed)",
        "Supply of chemicals and by-products",
        "Equipment service and maintenance"
      ]
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10">

        {/* Header Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            OUR CAPABILITIES
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tight">
            Sustainable <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Solutions</span>
          </h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto font-light">
            Delivering Consistent, Professional and Highest Quality Industrial Services.
          </p>
        </motion.div>

        {/* Services Grid Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="bg-white/5 border border-white/10 p-8 rounded-sm hover:border-primary/50 transition-all group relative overflow-hidden backdrop-blur-sm flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="mb-6 bg-background/50 inline-flex p-4 rounded-full border border-white/5 self-start shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-shadow">
                {category.icon}
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
                {category.title}
              </h3>

              {/* This maps through your bullet points automatically! */}
              <ul className="space-y-3 flex-grow">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-300 font-sans font-light text-sm flex items-start gap-3">
                    <span className="text-primary mt-1 text-xs">▹</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}