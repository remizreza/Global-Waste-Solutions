import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <Navbar />
      <Hero />
      <Partners />
      <Stats />
      <Services />
      <About />
      <Contact />

      <footer className="py-8 bg-black text-center border-t border-white/10">
        <p className="text-gray-500 text-sm font-tech">
          © {new Date().getFullYear()} REDOXY KSA. All rights reserved. | CR:
          2055137314 | VAT: 311718861100003
        </p>
      </footer>
    </div>
  );
}
