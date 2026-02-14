import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-display font-bold tracking-tighter text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center rounded-sm">
              <span className="text-primary text-xl">R</span>
            </div>
            REDOXY
          </a>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {["Technology", "Services", "Traction", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-tech text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              {item}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 px-6 py-2 rounded-sm font-tech font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]"
          >
            Contact Us
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {["Technology", "Services", "Traction", "About", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-lg font-tech text-gray-300 hover:text-primary flex items-center justify-between group"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </a>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
