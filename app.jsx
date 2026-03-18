import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Sales from '@/pages/Sales';
import Purchases from '@/pages/Purchases';
import Invoices from '@/pages/Invoices';
import Bills from '@/pages/Bills';
import JournalEntries from '@/pages/JournalEntries';
import Taxes from '@/pages/Taxes';
import Reconciliation from '@/pages/Reconciliation';
import OdooSettings from '@/pages/OdooSettings';
import { Toaster as Sonner } from 'sonner';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Sales" element={<Sales />} />
        <Route path="/Purchases" element={<Purchases />} />
        <Route path="/Invoices" element={<Invoices />} />
        <Route path="/Bills" element={<Bills />} />
        <Route path="/JournalEntries" element={<JournalEntries />} />
        <Route path="/Taxes" element={<Taxes />} />
        <Route path="/Reconciliation" element={<Reconciliation />} />
        <Route path="/OdooSettings" element={<OdooSettings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
