import SiteLayout from "@/components/SiteLayout";

const tradingHubItems = [
  "Gas Oil",
  "Light Oils",
  "Naphtha",
  "Recovered Oil",
  "Oilfield Chemicals",
];

export default function Products() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-14">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              PRODUCTS & TRADING
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              UAE Trading Hub
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Streamlined procurement and logistics for strategic industrial
              commodities across GCC corridors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingHubItems.map((item) => (
              <div
                key={item}
                className="product-card border border-white/10 rounded-lg p-6 bg-card/50 backdrop-blur-sm"
              >
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                  Trading Focus
                </p>
                <h2 className="text-2xl font-display text-white mb-3">{item}</h2>
                <p className="text-gray-300 text-sm">
                  High-velocity supply alignment for refinery and industrial
                  demand.
                </p>
                <div className="mt-4">
                  <QuickEnquiryDialog
                    productName={item}
                    triggerLabel="Quick Enquiry"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
import QuickEnquiryDialog from "@/components/QuickEnquiryDialog";
