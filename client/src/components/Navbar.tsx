import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/redoxy/logo.png";

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

  const navItems = ["Technology", "Services", "Traction", "About"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-secondary/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          {/* 🚨 Here is the fix for the overlap! Added shrink-0 and hidden xl:block */}
          <div className="cursor-pointer flex items-center gap-3 hover:scale-105 transition-transform duration-300 shrink-0">
            <img
              src={logo}
              alt="Redoxy Logo"
              className="h-10 w-auto min-w-[40px]"
            />
            <span className="hidden xl:block text-2xl font-display font-bold tracking-tighter text-white">
              REDOXY
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <a className="cursor-pointer text-sm font-tech text-gray-300 hover:text-primary hover:scale-110 transition-all duration-300 uppercase tracking-widest inline-block">
                {item}
              </a>
            </Link>
          ))}

          <Link href="/contact">
            <a className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-sm font-tech font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20">
              Contact Us
            </a>
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
            className="md:hidden bg-secondary border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {[...navItems, "Contact"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <a
                    className="cursor-pointer text-lg font-tech text-gray-300 hover:text-primary flex items-center justify-between group transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </a>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
