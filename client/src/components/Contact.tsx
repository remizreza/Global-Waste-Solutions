import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-black relative">
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 brightness-100 contrast-150"></div>
       
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-tech text-primary tracking-widest uppercase mb-4">Get In Touch</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Collaborate?</span>
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-sm">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Headquarters</h4>
                <p className="text-gray-400">P.O. Box 1234, Jubail Industrial City,<br />Kingdom of Saudi Arabia</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-sm">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Phone</h4>
                <p className="text-gray-400">+966 13 123 4567</p>
                <p className="text-gray-400">+966 50 123 4567</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-sm">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Email</h4>
                <p className="text-gray-400">info@redoxy.sa</p>
                <p className="text-gray-400">support@redoxy.sa</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/5 p-8 border border-white/10 rounded-sm backdrop-blur-sm"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-tech text-gray-500 uppercase tracking-widest">Name</label>
                  <input type="text" id="name" className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-tech text-gray-500 uppercase tracking-widest">Email</label>
                  <input type="email" id="email" className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-tech text-gray-500 uppercase tracking-widest">Subject</label>
                <input type="text" id="subject" className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Project Inquiry" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-tech text-gray-500 uppercase tracking-widest">Message</label>
                <textarea id="message" rows={4} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Tell us about your project..." />
              </div>
              
              <button type="button" className="w-full py-4 bg-primary text-background font-bold font-display uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
                Send Message
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
