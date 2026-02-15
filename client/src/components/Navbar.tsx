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

  // I put your menu items in a list here to make it cleaner!
  const navItems = ["Technology", "Services", "Traction", "About"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="cursor-pointer text-2xl font-display font-bold tracking-tighter text-white flex items-center gap-2 hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center rounded-sm">
              <span className="text-primary text-xl">R</span>
            </div>
            REDOXY
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <span className="cursor-pointer text-sm font-tech text-gray-400 hover:text-primary hover:scale-110 transition-all duration-300 uppercase tracking-widest inline-block">
                {item}
              </span>
            </Link>
          ))}

          <Link href="/contact">
            <span className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 px-6 py-2 rounded-sm font-tech font-bold uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]">
              Contact Us
            </span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white hover:scale-110 transition-transform"
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
              {[...navItems, "Contact"].map(
                (item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <span
                      className="cursor-pointer text-lg font-tech text-gray-300 hover:text-primary flex items-center justify-between group transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </span>
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}