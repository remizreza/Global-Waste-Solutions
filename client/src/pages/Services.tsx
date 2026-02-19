import { motion } from "framer-motion";
import { Droplets, Factory, Wrench, Fuel, HardHat } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Services() {
  const serviceCategories = [
    {
      title: "Waste Water & Environmental",
      icon: <Droplets className="w-8 h-8 text-white" />,
      bgImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
      items: [
        "Advanced chemical oxidation",
        "Reverse Osmosis & Vacuum Evaporation",
        "Electro oxidation",
        "Oil and sludge treatment",
        "Hazardous waste handling & cleaning",
        "Industrial waste water evaporation",
        "Tank and pond cleaning & sludge removal",
      ],
    },
    {
      title: "Industrial Services",
      icon: <Factory className="w-8 h-8 text-white" />,
      bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=2070",
      items: [
        "Chemical Cleaning (Boilers, reactors, pipelines)",
        "Blasting & Painting of Pipelines (API standard)",
        "Hydro milling & hydro jetting",
        "Steam tracing for oil pipelines",
        "Repair & Crude oil washing of Tanks",
        "Hydraulic Bolt torquing & On-site Machining",
        "Fabrication & Maintenance of equipment",
      ],
    },
    {
      title: "Support & Logistics",
      icon: <Wrench className="w-8 h-8 text-white" />,
      bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2070",
      items: [
        "Equipment Rental (pumps, generators, boilers)",
        "Media replacement operations",
        "Logistic services (vacuum tanks, super suckers)",
        "Supply of chemicals and by-products",
        "Equipment service and maintenance",
      ],
    },
    {
      title: "UAE PRODUCT LIST: LUBRICANTS",
      icon: <Fuel className="w-8 h-8 text-white" />,
      bgImage: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?auto=format&fit=crop&q=80&w=2070",
      items: [
        "Engine Oil SAE 40",
        "Gear Oil EP90",
        "Hydraulic Oil ISO 68",
        "Industrial Grease (Lithium)",
        "Base Oil",
      ],
    },
    {
      title: "UAE PRODUCT LIST: OILFIELD",
      icon: <HardHat className="w-8 h-8 text-white" />,
      bgImage: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=2070",
      items: [
        "Oilfield Specialized Equipment",
        "Drilling Support Services",
        "Maintenance & Supply",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />

        <div className="container mx-auto relative z-10">
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
              Sustainable{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
                Solutions
              </span>
            </h2>
          </motion.div>

          {/* The Upgraded Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative group h-[600px] rounded-sm overflow-hidden border border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
              >
                {/* Background Image with Zoom on Hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.bgImage})` }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40 group-hover:to-background/20 transition-all duration-500" />

                {/* Content Container */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <div className="mb-6 bg-primary/80 inline-flex p-4 rounded-full self-start shadow-[0_0_15px_rgba(20,184,166,0.5)] group-hover:-translate-y-2 transition-transform duration-300">
                    {category.icon}
                  </div>

                  <h3 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider border-b border-primary/30 pb-4 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>

                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-gray-300 font-sans font-light text-sm flex items-start gap-3 group-hover:text-white transition-colors duration-300"
                      >
                        <span className="text-primary mt-1 text-xs">▹</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="py-8 bg-black text-center border-t border-white/10">
        <p className="text-gray-500 text-sm font-tech">
          © {new Date().getFullYear()} REDOXY KSA. All rights reserved. | CR: 2055137314 | VAT: 311718861100003
        </p>
      </footer>
    </div>
  );
}
