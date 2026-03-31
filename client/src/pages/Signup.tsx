import SiteLayout from "@/components/SiteLayout";
import { Link } from "wouter";
import { pageLinks } from "@/lib/siteContent";

export default function Signup() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-xl">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-8 backdrop-blur-xl">
            <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-3">
              New Trader Onboarding
            </p>
            <h1 className="text-3xl font-display text-white mb-2">Sign Up</h1>
            <p className="text-gray-300 mb-7">
              Create your account and start tracking live Brent and Platts pricing.
            </p>

            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Full Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Email</span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Password</span>
                <input
                  type="password"
                  placeholder="Set password"
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary"
                  required
                />
              </label>

              <Link href={pageLinks.login} className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-tech uppercase tracking-[0.16em] text-black transition hover:brightness-105">
                  Continue to Login
                </Link>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
