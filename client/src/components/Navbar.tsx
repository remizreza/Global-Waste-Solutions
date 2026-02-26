import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { pageLinks } from "@/lib/siteContent";

const navItems = [
  { label: "Services", href: pageLinks.services },
  { label: "Technology", href: pageLinks.technology },
  { label: "Traction", href: pageLinks.traction },
  { label: "About", href: pageLinks.about },
  { label: "Products", href: pageLinks.products },
  { label: "Contact", href: pageLinks.contact },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-secondary/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={pageLinks.home}>
          <a className="flex items-center gap-3 shrink-0 min-w-0">
            <img
              src="/redoxy-icon.png"
              alt="REDOXY emblem"
              className="h-10 w-10 md:h-11 md:w-11 object-contain drop-shadow-[0_0_16px_rgba(37,99,235,0.35)]"
              loading="eager"
            />
            <svg
              className="h-10 md:h-12 w-auto drop-shadow-[0_0_12px_rgba(37,99,235,0.25)]"
              viewBox="0 0 320 82"
              role="img"
              aria-label="REDOXY"
            >
              <defs>
                <linearGradient id="rSplit" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#002D72" />
                  <stop offset="48%" stopColor="#002D72" />
                  <stop offset="52%" stopColor="#F37021" />
                  <stop offset="100%" stopColor="#F37021" />
                </linearGradient>
                <style>
                  {`
                  .logo-font {
                    font-family: 'Montserrat', 'Inter', sans-serif;
                    font-weight: 900;
                    letter-spacing: -1px;
                  }
                  `}
                </style>
              </defs>
              <g transform="translate(0,64)">
                {/* left leg split: overlay gradient bar on top of the navy R */}
                <rect x="0" y="-56" width="20" height="56" rx="2" fill="url(#rSplit)" />
                <text
                  x="0"
                  y="0"
                  fill="#002D72"
                  fontSize="56"
                  className="logo-font"
                >
                  R
                </text>
                <text
                  x="52"
                  y="0"
                  fill="#002D72"
                  fontSize="56"
                  className="logo-font"
                >
                  ED
                </text>
                <text
                  x="146"
                  y="0"
                  fill="#F37021"
                  fontSize="56"
                  className="logo-font"
                >
                  O
                </text>
                <text
                  x="195"
                  y="0"
                  fill="#002D72"
                  fontSize="56"
                  className="logo-font"
                >
                  XY
                </text>
                <text
                  x="280"
                  y="-24"
                  fill="#002D72"
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="'Montserrat','Inter',sans-serif"
                >
                  ®
                </text>
              </g>
            </svg>
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                aria-current={location === item.href ? "page" : undefined}
                className={`text-sm font-tech uppercase tracking-widest transition-all ${
                  location === item.href
                    ? "text-primary"
                    : "text-gray-300 hover:text-primary"
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          className="md:hidden text-white"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`text-lg font-tech flex items-center justify-between ${
                      location === item.href ? "text-primary" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                    <ChevronRight className="w-4 h-4 text-primary" />
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
