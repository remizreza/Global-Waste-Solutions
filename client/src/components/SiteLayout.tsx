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
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <SmoothScrollProvider />
      <CustomCursor />
      <Navbar />
      <main>{children}</main>
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

      <footer className="border-t border-white/10 bg-secondary">
        <div className="container mx-auto px-6 py-12 md:py-16 space-y-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] items-start">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.22em] text-primary font-tech">About REDOXY</p>
              <h2 className="text-2xl md:text-3xl font-display text-white">
                Integrated industrial execution for KSA + UAE growth
              </h2>
              <p className="max-w-3xl text-gray-300 leading-relaxed">
                REDOXY connects waste management, technology modules, trading, and delivery programs across one
                integrated platform. Navigate each page as a connected journey: Services → Technology → Traction →
                Products → Contact.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  className="rounded-xl border border-white/15 bg-white/[0.04] text-center py-3 px-2 text-xs font-tech uppercase tracking-wider text-white"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/20" />

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title} className="space-y-3">
                  <h3 className="text-xl text-white font-display">{column.title}</h3>
                  <ul className="space-y-2">
                    {column.links.map((linkItem) => (
                      <li key={linkItem.label}>
                        <Link href={linkItem.href}>
                          <a className="text-gray-300 hover:text-primary transition-colors">{linkItem.label}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl text-white font-display">Page Correlation Map</h3>
              <div className="space-y-3">
                {correlationLinks.map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Link href={item.from}>
                        <a className="text-primary hover:underline">{item.from}</a>
                      </Link>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <Link href={item.to}>
                        <a className="text-primary hover:underline">{item.to}</a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2 border-t border-white/10 md:flex-row md:justify-between md:items-center">
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <a href={contactDetails.mapsUAE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                <MapPin className="h-4 w-4" /> UAE
              </a>
              <a href={`tel:${contactDetails.phoneKSA}`} className="inline-flex items-center gap-1 hover:text-primary">
                <Phone className="h-4 w-4" /> KSA
              </a>
              <a href={`mailto:${contactDetails.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                <Mail className="h-4 w-4" /> Email
              </a>
              <a href={`https://${contactDetails.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                <Globe className="h-4 w-4" /> Website
              </a>
            </div>

            <div className="flex items-center gap-4 text-gray-300">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="hover:text-primary text-lg font-bold leading-none"
              >
                X
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <p className="text-gray-500 text-sm font-tech">© 2000 REDOXY Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
