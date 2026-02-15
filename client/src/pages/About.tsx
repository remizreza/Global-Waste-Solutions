import { motion } from "framer-motion";
import { Target, Eye, Users, Lightbulb, Leaf } from "lucide-react";

export default function About() {
  const pillars = [
    {
      title: "Expert Team",
      description: "Our team of experienced professionals is dedicated to finding the best solutions for your environmental challenges.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    {
      title: "Innovation",
      description: "We stay ahead by adopting the latest technologies and practices in waste management.",
      icon: <Lightbulb className="w-6 h-6 text-primary" />
    },
    {
      title: "Sustainability",
      description: "We are committed to reducing the environmental impact of waste and promoting sustainable living.",
      icon: <Leaf className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-6xl">

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            WHO WE ARE
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-8">
            Sustainable Solutions <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">For A Greener Future</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            At REDOXY, we are committed to creating a cleaner and more sustainable environment for present and future generations. As a leading environmental and waste management company in Saudi Arabia, we specialize in providing innovative solutions and research and development for waste reduction, treatment, and environmental protection.
          </p>
        </motion.div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 border border-white/10 p-10 rounded-sm backdrop-blur-sm hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
              <div className="bg-primary/20 p-3 rounded-full">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Our Mission</h2>
            </div>
            <p className="text-gray-400 font-sans font-light leading-relaxed">
              Our mission is to revolutionize waste management in Saudi Arabia by providing innovative and sustainable solutions that minimize environmental impact. We are dedicated to transforming waste into valuable resources, fostering cleaner communities, and contributing to a greener future for generations to come.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 border border-white/10 p-10 rounded-sm backdrop-blur-sm hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
              <div className="bg-primary/20 p-3 rounded-full">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Our Vision</h2>
            </div>
            <p className="text-gray-400 font-sans font-light leading-relaxed">
              Our vision at REDOXY is to lead the way in setting new standards for waste management excellence. We aim to be the preferred partner for businesses and communities seeking responsible waste disposal and recycling solutions. By leveraging cutting-edge technology, fostering partnerships, and promoting environmental awareness, we strive to create a cleaner and more sustainable Saudi Arabia.
            </p>
          </motion.div>
        </div>

        {/* Three Pillars Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {pillars.map((pillar, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-background/50 border border-white/5 p-6 rounded-sm text-center group hover:bg-white/5 transition-all"
            >
              <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3 uppercase tracking-wide">{pillar.title}</h3>
              <p className="text-gray-400 text-sm font-light">{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}