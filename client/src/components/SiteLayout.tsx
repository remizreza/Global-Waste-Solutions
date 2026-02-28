import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { contactDetails } from "@/lib/siteContent";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import FloatingChatbot from "@/components/FloatingChatbot";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <SmoothScrollProvider />
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
      <footer className="py-8 bg-secondary/95 text-center border-t border-white/10">
        <p className="text-gray-500 text-sm font-tech px-4">
          © 2000 REDOXY Group. All rights reserved. | KSA + UAE | ESG aligned operations
        </p>
      </footer>
    </div>
  );
}
