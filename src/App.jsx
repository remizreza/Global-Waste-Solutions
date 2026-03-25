import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Invoices from "@/pages/Invoices";
import Bills from "@/pages/Bills";
import JournalEntries from "@/pages/JournalEntries";
import Taxes from "@/pages/Taxes";
import Reconciliation from "@/pages/Reconciliation";
import OdooSettings from "@/pages/OdooSettings";
import PageNotFound from "@/lib/PageNotFound";
import { ErrorBlock, LoadingBlock, useAppMeta } from "@/pages/_helpers";

function HomeRoute() {
  const meta = useAppMeta();

  if (meta.isLoading) {
    return <LoadingBlock />;
  }

  if (meta.error) {
    return <ErrorBlock error={meta.error} />;
  }

  if (meta.data?.role === "accountant") {
    return <Navigate to="/sales" replace />;
  }

  return <Dashboard />;
}

function AdminOnlyRoute({ children }) {
  const meta = useAppMeta();

  if (meta.isLoading) {
    return <LoadingBlock />;
  }

  if (meta.error) {
    return <ErrorBlock error={meta.error} />;
  }

  if (!meta.data?.permissions?.manageSettings) {
    return <Navigate to="/sales" replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <PageNotFound />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: "sales", element: <Sales /> },
      { path: "purchases", element: <Purchases /> },
      { path: "invoices", element: <Invoices /> },
      { path: "bills", element: <Bills /> },
      { path: "journal-entries", element: <JournalEntries /> },
      { path: "taxes", element: <AdminOnlyRoute><Taxes /></AdminOnlyRoute> },
      { path: "reconciliation", element: <AdminOnlyRoute><Reconciliation /></AdminOnlyRoute> },
      { path: "odoo-settings", element: <AdminOnlyRoute><OdooSettings /></AdminOnlyRoute> },
    ],
  },
]);
