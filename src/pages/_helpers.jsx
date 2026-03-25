import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import { formatCurrency } from "@/lib/utils";

export function PageIntro({ eyebrow, title, description }) {
  return (
    <header className="page-shell">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{eyebrow}</p>
        <h2 className="mt-2 section-title">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
    </header>
  );
}

export function KpiGrid({ items }) {
  const navigate = useNavigate();

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className={item.to ? "cursor-pointer transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md" : ""}
          onClick={item.to ? () => navigate(item.to) : undefined}
        >
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="break-words text-2xl leading-tight sm:text-3xl">{item.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            {item.helpText}
            {item.to ? <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Open details</div> : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function DataTableCard({ title, description, columns, rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id ?? row.name ?? "row"}-${index}`} className="border-b last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 text-slate-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key] ?? "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function useOdooRecords({ queryKey, model, fields, domain = [], limit = 10, order = "write_date desc" }) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    enabled: isAuthenticated,
    queryFn: async () =>
      (await apiRequest("/api/odoo/read", {
        method: "POST",
        token,
        body: {
          model,
          domain,
          fields,
          limit,
          order,
        },
      })).rows,
  });
}

export function useOdooCount({ queryKey, model, domain = [] }) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    enabled: isAuthenticated,
    queryFn: async () =>
      (await apiRequest("/api/odoo/count", {
        method: "POST",
        token,
        body: { model, domain },
      })).value,
  });
}

export function useOdooAggregate({ queryKey, model, field, domain = [] }) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    enabled: isAuthenticated,
    queryFn: async () =>
      (await apiRequest("/api/odoo/aggregate", {
        method: "POST",
        token,
        body: { model, field, domain },
      })).value,
  });
}

export function useAppMeta() {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["app-meta"],
    enabled: isAuthenticated,
    queryFn: () => apiRequest("/api/meta", { token }),
  });
}

export function useAdminSummary(enabled = true) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["admin-dashboard-summary"],
    enabled: isAuthenticated && enabled,
    queryFn: () => apiRequest("/api/dashboard/admin-summary", { token }),
  });
}

export function ConnectionGate({ children }) {
  const { isAuthenticated } = useAuth();
  const meta = useAppMeta();

  if (!isAuthenticated) {
    return <UserNotRegisteredError message="Please sign in to access the REDOXY ERP workspace." />;
  }

  if (meta.isLoading) {
    return <LoadingBlock />;
  }

  if (meta.error) {
    return <ErrorBlock error={meta.error} />;
  }

  if (!meta.data?.odooConfigured) {
    return <UserNotRegisteredError message="Open Odoo Settings and save a valid connection before loading accounting data." />;
  }

  return children;
}

export function LoadingBlock() {
  return (
    <Card>
      <CardContent className="py-10 text-sm text-slate-500">Loading Odoo data...</CardContent>
    </Card>
  );
}

export function ErrorBlock({ error }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="py-6 text-sm text-red-700">{error?.message ?? "Something went wrong while loading Odoo data."}</CardContent>
    </Card>
  );
}

export function Money({ value }) {
  return formatCurrency(value);
}
