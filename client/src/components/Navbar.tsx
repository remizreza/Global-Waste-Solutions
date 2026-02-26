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
            <svg
              className="h-10 md:h-12 w-auto drop-shadow-[0_0_16px_rgba(37,99,235,0.35)]"
              viewBox="0 0 280 80"
              role="img"
              aria-label="REDOXY"
            >
              <defs>
                <style>
                  {`
                  .logo-font {
                    font-family: 'Montserrat', 'Inter', sans-serif;
                    font-weight: 900;
                  }
                  `}
                </style>
              </defs>
              <g>
                {/* stylized orange "t" */}
                <rect x="8" y="12" width="18" height="56" rx="4" fill="#F37021" />
                <rect x="8" y="12" width="32" height="14" rx="4" fill="#F37021" />

                {/* RED */}
                <text
                  x="50"
                  y="58"
                  fill="#002D72"
                  fontSize="54"
                  letterSpacing="-1"
                  className="logo-font"
                >
                  RED
                </text>

                {/* O ring */}
                <circle cx="178" cy="40" r="24" fill="none" stroke="#F37021" strokeWidth="10" />

                {/* XY */}
                <text
                  x="210"
                  y="58"
                  fill="#002D72"
                  fontSize="54"
                  letterSpacing="-1"
                  className="logo-font"
                >
                  XY
                </text>

                {/* trademark */}
                <text
                  x="262"
                  y="20"
                  fill="#002D72"
                  fontSize="12"
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
