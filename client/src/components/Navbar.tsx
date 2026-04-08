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
          ? "nav-glass border-b border-emerald-950/40 shadow-[0_12px_38px_rgba(4,14,10,0.42)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex min-h-20 items-center justify-between px-6 py-3">
        <Link href={pageLinks.home} className="flex min-w-0 shrink-0 items-start gap-3">
          <span className="relative inline-flex pt-1">
            <span className="absolute inset-0 rounded-full bg-orange-400/35 blur-md animate-pulse" />
            <img
              src="/redoxy-icon.png"
              alt="REDOXY emblem"
              className="relative h-10 w-10 object-contain drop-shadow-[0_0_18px_rgba(255,122,0,0.45)] lg:h-11 lg:w-11"
              loading="eager"
            />
          </span>
          <span className="flex min-w-0 flex-col">
            <RedoxyWordmark className="text-3xl transition-all duration-300 md:text-[2rem]" />
            <span className="mt-1 text-[10px] font-tech uppercase tracking-[0.24em] text-slate-300 md:text-[11px]">
              <span className="text-primary">Recover.</span>{" "}
              <span className="text-slate-200">Reprocess.</span>{" "}
              <span className="text-primary">Reuse.</span>
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <div className="flex items-center gap-6">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={location === item.href ? "page" : undefined}
                className={`relative text-sm font-tech uppercase tracking-[0.16em] transition-all after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:bg-primary after:transition-all ${
                  location === item.href
                    ? "text-primary after:w-full"
                    : "text-gray-300 after:w-0 hover:text-primary hover:after:w-full"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-full border border-emerald-900/35 bg-[linear-gradient(145deg,rgba(6,16,28,0.76),rgba(10,34,16,0.52))] px-5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {utilityNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={location === item.href ? "page" : undefined}
                className={`text-[11px] font-tech uppercase tracking-[0.18em] transition-colors ${
                  location === item.href ? "text-primary" : "text-slate-300 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: motionDuration.ui, ease: MOTION_EASE }}
            className="lg:hidden mx-4 mt-2 origin-top rounded-[1.4rem] border border-emerald-950/40 bg-[linear-gradient(155deg,rgba(6,16,28,0.94),rgba(10,34,16,0.88))] backdrop-blur-xl"
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
