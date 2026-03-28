import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Facebook,
  Linkedin,
  MessageCircle,
  Phone,
  Globe,
  Mail,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { contactDetails, pageLinks } from "@/lib/siteContent";
import CustomCursor from "@/components/CustomCursor";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import FloatingChatbot from "@/components/FloatingChatbot";
import ScrollStage from "@/components/ScrollStage";
import usePremiumInteractions from "@/hooks/use-premium-interactions";

type SiteLayoutProps = {
  children: ReactNode;
};

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "Home", href: pageLinks.home },
      { label: "About REDOXY", href: pageLinks.about },
      { label: "Contact Us", href: pageLinks.contact },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Environmental Services", href: pageLinks.services },
      { label: "Technology Modules", href: pageLinks.technology },
      { label: "Traction & Milestones", href: pageLinks.traction },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Industrial Trading", href: pageLinks.products },
      { label: "Book Consultation", href: pageLinks.contact },
      { label: "Get Proposal", href: pageLinks.contact },
    ],
  },
];

const correlationLinks = [
  {
    title: "Start with services",
    description: "See execution capabilities and solution domains.",
    from: pageLinks.services,
    to: pageLinks.technology,
  },
  {
    title: "Validate with technology",
    description: "Understand engineering stack and treatment process.",
    from: pageLinks.technology,
    to: pageLinks.traction,
  },
  {
    title: "Confirm outcomes",
    description: "Review traction, then proceed to products and contact.",
    from: pageLinks.traction,
    to: pageLinks.products,
  },
];

export default function SiteLayout({ children }: SiteLayoutProps) {
  usePremiumInteractions();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <SmoothScrollProvider />
      <CustomCursor />
      <Navbar />
      <main className="relative">
        <div className="site-ambient pointer-events-none fixed inset-0 -z-10" />
        {children}
      </main>
      <FloatingChatbot />
      <a
        href={contactDetails.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="btn-whatsapp-premium fixed bottom-5 left-5 z-50 h-12 w-12 rounded-full p-0"
      >
        <span className="absolute inset-0 rounded-full bg-cyan-400/35 blur-md animate-pulse" />
        <MessageCircle className="h-6 w-6" />
      </a>

      <footer className="footer-luxury border-t border-white/10">
        <div className="container mx-auto max-w-[1480px] px-6 py-12 md:py-16 space-y-10">
          <ScrollStage mode="elegant">
          <div className="footer-panel rounded-[1.9rem] p-6 md:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-5">
              <p className="eyebrow-pill w-fit">About REDOXY</p>
              <h2 className="footer-title max-w-xl text-3xl md:text-4xl font-display leading-[1.02]">
                Integrated industrial execution for KSA + UAE growth
              </h2>
              <p className="editorial-copy max-w-xl text-[15px]">
                REDOXY connects waste management, technology modules, trading, and delivery programs across one
                integrated platform. Navigate each page as a connected journey: Services → Technology → Traction →
                Products → Contact.
              </p>
              <div className="footer-divider" />
              <div className="footer-stat-grid grid gap-3 sm:grid-cols-3">
                {[
                  { value: "KSA + UAE", label: "Operating Base" },
                  { value: "Modular MTU", label: "Flagship Platform" },
                  { value: "Vision 2030", label: "Strategic Direction" },
                ].map((item) => (
                  <div key={item.label} className="footer-stat rounded-[1.2rem] px-4 py-4">
                    <p className="text-white font-display text-xl">{item.value}</p>
                    <p className="mt-1 text-[11px] font-tech uppercase tracking-[0.22em] text-white/55">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-start lg:pt-2">
              {[
                "ISO-aligned Ops",
                "Modular MTU",
                "GCC Ready",
                "Execution First",
                "ESG Focus",
                "Vision 2030",
              ].map((badge) => (
                <div
                  key={badge}
                  className="footer-badge rounded-[1.1rem] px-3 py-3 text-center text-xs font-tech uppercase tracking-wider text-white/90"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="footer-divider my-8" />

          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-start">
            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title} className="space-y-3">
                  <h3 className="text-lg text-white font-display">{column.title}</h3>
                  <ul className="space-y-2">
                    {column.links.map((linkItem) => (
                      <li key={linkItem.label}>
                        <Link href={linkItem.href} className="footer-link">{linkItem.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="section-label text-xs">Journey Map</p>
              <h3 className="text-2xl text-white font-display">Page Correlation Map</h3>
              <div className="space-y-3">
                {correlationLinks.map((item) => (
                  <div key={item.title} className="footer-corridor rounded-[1.3rem] p-4">
                    <p className="text-white font-medium text-base">{item.title}</p>
                    <p className="text-sm text-gray-300 mb-3 leading-6">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Link href={item.from} className="footer-path">{item.from}</Link>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <Link href={item.to} className="footer-path">{item.to}</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          </ScrollStage>

          <ScrollStage mode="elegant">
          <div className="footer-subgrid flex flex-col gap-5 rounded-[1.5rem] px-5 py-5 md:flex-row md:justify-between md:items-center">
            <div className="flex flex-col gap-3 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:gap-4">
              <a href={contactDetails.mapsUAE} target="_blank" rel="noreferrer" className="footer-contact">
                <MapPin className="h-4 w-4" /> UAE
              </a>
              <a href={`tel:${contactDetails.phoneKSA}`} className="footer-contact">
                <Phone className="h-4 w-4" /> KSA
              </a>
              <a href={`mailto:${contactDetails.email}`} className="footer-contact">
                <Mail className="h-4 w-4" /> Email
              </a>
              <a href={`https://${contactDetails.website}`} target="_blank" rel="noreferrer" className="footer-contact">
                <Globe className="h-4 w-4" /> Website
              </a>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="footer-social"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="footer-social text-lg font-bold leading-none"
              >
                X
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="footer-social"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          </ScrollStage>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <p className="text-gray-500 text-sm font-tech">© 2000 REDOXY Group. All rights reserved.</p>
            <div className="flex items-center justify-center gap-3 md:justify-end">
              <Link href={pageLinks.services} className="link-premium !px-4 !py-2 !text-xs">Explore Services</Link>
              <Link href={pageLinks.contact} className="btn-premium !px-5 !py-2.5 !text-[10px]">Open Contact Desk</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
