import SiteLayout from "@/components/SiteLayout";
import { Link } from "wouter";
import { pageLinks } from "@/lib/siteContent";

export default function Login() {
  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-xl">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-8 backdrop-blur-xl">
            <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-3">
              Trader Access
            </p>
            <h1 className="text-3xl font-display text-white mb-2">Login</h1>
            <p className="text-gray-300 mb-7">
              Sign in to open your live trader dashboard with Brent and Platts updates.
            </p>

            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Email</span>
                <input
                  type="email"
                  placeholder="trader@redoxyksa.com"
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary"
                  required
                />
              </label>

              <Link href={pageLinks.dashboard} className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-tech uppercase tracking-[0.16em] text-black transition hover:brightness-105">
                  Open Live Dashboard
                </Link>
            </form>

            <p className="mt-3 text-xs text-gray-400">
              Admin? Use <Link href={pageLinks.adminLogin} className="text-primary hover:underline">Admin Login</Link>.
            </p>

            <p className="mt-6 text-sm text-gray-300">
              New trader?{" "}
              <Link href={pageLinks.signup} className="text-primary hover:underline">Create your account</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
