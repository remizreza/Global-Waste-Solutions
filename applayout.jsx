import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Package, FileText,
  Receipt, Calculator, Settings, ChevronLeft, ChevronRight,
  Building2, RefreshCw
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/Dashboard' },
  { label: 'Sales', icon: ShoppingCart, to: '/Sales' },
  { label: 'Purchases', icon: Package, to: '/Purchases' },
  { label: 'Invoices', icon: FileText, to: '/Invoices' },
  { label: 'Bills', icon: Receipt, to: '/Bills' },
  { label: 'Journal Entries', icon: Calculator, to: '/JournalEntries' },
  { label: 'Taxes', icon: Calculator, to: '/Taxes' },
  { label: 'Reconciliation', icon: RefreshCw, to: '/Reconciliation' },
  { label: 'Settings', icon: Settings, to: '/OdooSettings' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-slate-900 text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-700">
          <Building2 className="w-6 h-6 text-blue-400 shrink-0" />
          {!collapsed && <span className="font-bold text-sm truncate">Odoo Manager</span>}
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {nav.map(({ label, icon: Icon, to }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-700',
                  active ? 'bg-blue-600 text-white' : 'text-slate-300'
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center p-3 border-t border-slate-700 hover:bg-slate-700 text-slate-400"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
