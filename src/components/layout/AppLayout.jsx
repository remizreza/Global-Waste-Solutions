import { Home, Receipt, ShoppingCart, FileText, Landmark, Percent, RefreshCcw, Settings2, BookOpenText, LogOut, Activity } from "lucide-react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const navigation = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/sales", label: "Sales", icon: Receipt },
  { to: "/purchases", label: "Purchases", icon: ShoppingCart },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/bills", label: "Bills", icon: Landmark },
  { to: "/journal-entries", label: "Journal Entries", icon: BookOpenText },
  { to: "/taxes", label: "Taxes", icon: Percent },
  { to: "/reconciliation", label: "Reconciliation", icon: RefreshCcw },
  { to: "/odoo-settings", label: "Odoo Settings", icon: Settings2 },
];

function getVisibleNavigation(role) {
  if (role === "accountant") {
    return navigation.filter((item) => !["/", "/taxes", "/reconciliation", "/odoo-settings"].includes(item.to));
  }

  if (role === "viewer") {
    return navigation.filter((item) => !["/odoo-settings"].includes(item.to));
  }

  return navigation;
}

export default function AppLayout() {
  const { isAuthenticated, user, logout, bootstrapped } = useAuth();
  const visibleNavigation = getVisibleNavigation(user?.role);

  if (!bootstrapped) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel overflow-hidden lg:sticky lg:top-5 lg:self-start">
          <div className="border-b px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Finance cockpit</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7f1d1d] text-white shadow-lg shadow-red-950/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">REDOXY ERP</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f1d1d]">Driven by Odoo</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">REDOXY operating workspace for sales, procurement, finance, taxes, and reconciliation.</p>
          </div>
          <div className="border-b px-5 py-4 sm:px-6">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user?.role}</p>
          </div>
          <ScrollArea className="max-h-[40vh] lg:h-[calc(100vh-13rem)] lg:max-h-none">
            <nav className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-1 lg:space-y-1">
              {visibleNavigation.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  end={end}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:min-h-0",
                      isActive && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
          <div className="border-t p-4">
            <Button className="w-full" variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="glass-panel min-h-[calc(100vh-2.5rem)] overflow-hidden">
          <div className="h-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
