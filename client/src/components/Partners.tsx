// 1. Import the images at the top of the file
import aramcoLogo from "@assets/aramco_logo.png";
import sabicLogo from "@assets/sabic_logo.png";
import maadenLogo from "@assets/maaden_logo.png";

export default function Partners() {
  return (
    <section className="py-10 bg-black border-y border-white/10">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-tech text-gray-500 uppercase tracking-widest mb-10">
          Servicing Affiliates & Trusted By
        </p>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
          {/* 2. Replace the <h3> tags with <img> tags */}

          <img
            src={aramcoLogo}
            alt="Aramco"
            className="h-8 md:h-12 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />

          <img
            src={sabicLogo}
            alt="SABIC"
            className="h-8 md:h-12 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />

          <img
            src={maadenLogo}
            alt="Ma'aden"
            className="h-8 md:h-12 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
        </div>
      </div>
    </section>
  );
}
