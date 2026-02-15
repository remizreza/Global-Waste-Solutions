import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Mail, Send, Building2 } from "lucide-react";

export default function Contact() {
  const contactInfo = [
    {
      title: "KSA Headquarters",
      details: ["7766 Omar Bin Abdulaziz Street", "Al Danah, Jubayl 35514", "Saudi Arabia"],
      icon: <MapPin className="w-6 h-6 text-primary" />,
      delay: 0.2
    },
    {
      title: "UAE Trade Hub",
      details: ["REDOXY FZC", "Connecting to International Markets", "United Arab Emirates"],
      icon: <Building2 className="w-6 h-6 text-primary" />,
      delay: 0.4
    },
    {
      title: "Direct Contact",
      details: ["+966 53 378 6083", "www.redoxyksa.com", "info@redoxyksa.com"],
      icon: <Phone className="w-6 h-6 text-primary" />,
      delay: 0.6
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-7xl">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-tech text-sm tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            GLOBAL REACH
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">
            Partner With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">REDOXY</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-light">
            Ready to revolutionize your waste management? Reach out to our expert team for sustainable, industrial-grade solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Column: Contact Cards */}
          <div className="flex flex-col gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: info.delay }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-white/5 border border-white/10 p-6 rounded-sm flex items-start gap-6 group hover:border-primary/50 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                <div className="bg-background/80 p-4 rounded-full border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(20,184,166,0.1)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">{info.title}</h3>
                  <div className="flex flex-col gap-1">
                    {info.details.map((line, i) => (
                      <span key={i} className="text-gray-400 font-sans font-light text-sm">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 border border-white/10 p-8 rounded-sm backdrop-blur-sm relative overflow-hidden"
          >
            {/* Subtle glow effect behind the form */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <h3 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
              Send an Inquiry
            </h3>

            <form className="flex flex-col gap-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="bg-background/50 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans font-light"
                />
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  className="bg-background/50 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans font-light"
                />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-background/50 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans font-light"
              />
              <textarea 
                placeholder="How can we help you?" 
                rows={4}
                className="bg-background/50 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans font-light resize-none"
              ></textarea>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-primary text-background font-bold font-display uppercase tracking-wider rounded-sm hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 group mt-2"
                type="button"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Submit Inquiry
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}