import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AnimatePresence, motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Services = lazy(() => import("@/pages/Services"));
const Technology = lazy(() => import("@/pages/Technology"));
const Traction = lazy(() => import("@/pages/Traction"));
const Products = lazy(() => import("@/pages/Products"));

function AppRoutes() {
  return (
    <Switch>
      {/* The Master Traffic Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/services" component={Services} />
      <Route path="/technology" component={Technology} />
      <Route path="/traction" component={Traction} />
      <Route path="/products" component={Products} />

      {/* The 404 Error Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AnimatedRouter() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <AppRoutes />
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-24 w-24 rounded-full border border-orange-400/40 animate-[spin_2.7s_linear_infinite]" />
                <span className="absolute h-18 w-18 rounded-full border border-blue-400/45 animate-[spin_2s_linear_infinite_reverse]" />
                <img
                  src="/redoxy-icon.png"
                  alt="Loading"
                  className="w-14 h-14 object-contain animate-[spin_4.2s_linear_infinite]"
                />
              </div>
              <p className="mt-5 text-xs tracking-[0.24em] font-tech text-gray-300">
                LOADING REDOXY EXPERIENCE
              </p>
            </div>
          }
        >
          <WouterRouter hook={useHashLocation}>
            <AnimatedRouter />
          </WouterRouter>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
