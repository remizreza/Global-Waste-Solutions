import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageLinks } from "@/lib/siteContent";
import { MOTION_EASE, motionDuration, slideIn } from "@/lib/motion";
import RedoxyWordmark from "@/components/RedoxyWordmark";

const primaryNavItems = [
  { label: "Services", href: pageLinks.services },
  { label: "Technology", href: pageLinks.technology },
  { label: "Traction", href: pageLinks.traction },
  { label: "Products", href: pageLinks.products },
  { label: "About", href: pageLinks.about },
  { label: "Contact", href: pageLinks.contact },
];

const utilityNavItems = [
  { label: "Dashboard", href: pageLinks.dashboard },
  { label: "Login", href: pageLinks.login },
  { label: "Admin", href: pageLinks.adminLogin },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "nav-glass border-b border-white/15 shadow-[0_10px_35px_rgba(6,12,28,0.45)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 pt-3">
        <div className={`flex h-18 items-center justify-between rounded-[1.4rem] border px-4 sm:px-6 transition-all duration-300 ${
          scrolled
            ? "border-white/12 bg-[#07101f]/82 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
            : "border-white/8 bg-black/10 backdrop-blur-md"
        }`}>
        <Link href={pageLinks.home} className="flex items-center gap-3 shrink-0 min-w-0">
            <span className="relative inline-flex">
              <span className="absolute inset-0 rounded-full bg-orange-400/35 blur-md animate-pulse" />
              <img
                src="/redoxy-icon.png"
                alt="REDOXY emblem"
                className="relative h-10 w-10 lg:h-11 lg:w-11 object-contain drop-shadow-[0_0_18px_rgba(255,122,0,0.45)]"
                loading="eager"
              />
            </span>
            <div className="min-w-0">
              <RedoxyWordmark className="text-3xl lg:text-[2rem] transition-all duration-300" />
              <p className="section-label mt-1 hidden text-[9px] lg:block">Industrial Infrastructure Group</p>
            </div>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2">
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={location === item.href ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-[11px] font-tech uppercase tracking-[0.16em] transition-all ${
                location === item.href
                  ? "bg-white/8 text-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-gray-200/88 hover:bg-white/[0.04] hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          </div>

          <div className="flex items-center gap-2 pl-2">
            {utilityNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={location === item.href ? "page" : undefined}
                className={`rounded-full border px-3 py-2 text-[10px] font-tech uppercase tracking-[0.16em] transition-all ${
                  location === item.href
                    ? "border-primary/45 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.02] text-gray-200/78 hover:border-white/20 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href={pageLinks.contact} className="btn-premium !px-5 !py-2.5 !text-[10px]">
              Start Discussion
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          className="lg:hidden text-white rounded-full border border-white/10 bg-white/[0.04] p-2"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: motionDuration.ui, ease: MOTION_EASE }}
            className="lg:hidden mx-4 mt-2 origin-top rounded-[1.4rem] border border-white/10 bg-[#07101f]/94 backdrop-blur-xl"
          >
            <motion.div
              className="flex flex-col p-6 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                    ease: MOTION_EASE,
                  },
                },
              }}
            >
              {[...primaryNavItems, ...utilityNavItems].map((item) => (
                <motion.div key={item.href} variants={slideIn("x", 16)}>
                  <Link
                    href={item.href}
                    className={`text-lg font-tech flex items-center justify-between ${
                      location === item.href ? "text-primary" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
