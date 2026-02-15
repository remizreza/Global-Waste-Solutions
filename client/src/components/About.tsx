import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-tech text-primary tracking-widest uppercase mb-4">About Us</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Pioneering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Circular Economy</span>
            </h3>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              REDOXY KSA is at the forefront of industrial sustainability, providing innovative solutions for waste management and resource recovery.
            </p>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Our mission is to support Saudi Vision 2030 by implementing cutting-edge technologies that transform waste into valuable resources, reducing environmental impact while creating economic value.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-2">50+</h4>
                <p className="text-sm font-tech text-gray-500 uppercase tracking-wider">Projects Completed</p>
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-2">1M+</h4>
                <p className="text-sm font-tech text-gray-500 uppercase tracking-wider">Tons Processed</p>
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
            <div className="aspect-square rounded-sm overflow-hidden border border-white/10 bg-white/5 relative">
               {/* Placeholder for about image - using a gradient/pattern for now */}
               <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
                 <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-primary/20 font-display text-9xl font-bold opacity-20">R</div>
                 </div>
               </div>
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
