import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  ConnectionGate,
  ErrorBlock,
  KpiGrid,
  LoadingBlock,
  Money,
  PageIntro,
  useAdminSummary,
  useAppMeta,
  useOdooAggregate,
  useOdooCount,
  useOdooRecords,
} from "@/pages/_helpers";

function AdminFinanceCard({ title, description, rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-600">{row.label}</span>
            <span className="font-semibold text-slate-900">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuarterStrip({ periods }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly volume</CardTitle>
        <CardDescription>Recent closed order volume grouped quarter by quarter.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {periods?.map((period, index) => (
          <div
            key={period.label}
            className={`summary-tile ${index === periods.length - 1 ? "border-2 border-sky-300 bg-sky-50 shadow-sm" : ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{period.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900"><Money value={period.amount} /></p>
            <p className="mt-2 text-sm text-slate-500">{period.count} orders closed</p>
            {index === periods.length - 1 ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Current quarter</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MonitoringStrip({ title, description, rows, amountKey = "amount", countKey = "count", labelKey = "label" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows?.map((row) => (
          <div key={row[labelKey] ?? row.owner} className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{row[labelKey] ?? row.owner}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900"><Money value={row[amountKey]} /></p>
            <p className="mt-2 text-sm text-slate-500">{row[countKey]} items</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WarningPanel({ warnings, operations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Management alerts</CardTitle>
        <CardDescription>Top-level monitoring signals for backlog, collection pressure, and payment risk.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {warnings?.map((warning) => (
          <div
            key={warning.title}
            className={`rounded-2xl border px-4 py-4 text-sm ${
              warning.level === "high"
                ? "border-red-200 bg-red-50"
                : warning.level === "medium"
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{warning.title}</p>
              <p className="font-semibold text-slate-900">
                {typeof warning.value === "number" && warning.value > 999 ? <Money value={warning.value} /> : warning.value}
              </p>
            </div>
            <p className="mt-1 text-slate-600">{warning.note}</p>
          </div>
        ))}
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confirmed sales orders</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{operations?.confirmedSales ?? 0}</p>
          </div>
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Posted payments</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{operations?.postedPayments ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatStatementHtml(statement) {
  const content = statement.entries
    .map(
      (entry) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${entry.name}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${entry.invoice_date || ""}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${entry.invoice_date_due || ""}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${entry.state}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${entry.payment_state || "not paid"}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${Money({ value: entry.amount_total })}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${Money({ value: entry.amount_residual })}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <html>
      <head>
        <title>${statement.customer} Statement</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          p { color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; }
        </style>
      </head>
      <body>
        <h1>${statement.customer}</h1>
        <p>Invoices: ${statement.totals.count} | Total invoiced: ${Money({ value: statement.totals.invoicedAmount })} | Open balance: ${Money({ value: statement.totals.openAmount })}</p>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>State</th>
              <th>Payment</th>
              <th style="text-align:right;">Amount</th>
              <th style="text-align:right;">Balance</th>
            </tr>
          </thead>
          <tbody>${content}</tbody>
        </table>
      </body>
    </html>
  `;
}

function CustomerStatements({ rows }) {
  const [expanded, setExpanded] = useState(false);
  const { token } = useAuth();
  const visibleRows = expanded ? rows : rows?.slice(0, 5);
  const detailMutation = useMutation({
    mutationFn: (partnerId) => apiRequest(`/api/dashboard/customer-statements/${partnerId}`, { token }),
  });

  const openPrintableView = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      return;
    }

    const content = rows
      .map(
        (row) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${row.customer}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${row.count}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${Money({ value: row.invoicedAmount })}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${Money({ value: row.openAmount })}</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Statements</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin-bottom: 8px; }
            p { color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <h1>Customer Statements</h1>
          <p>Management summary from REDOXY ERP</p>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th style="text-align:right;">Open Items</th>
                <th style="text-align:right;">Total Invoiced</th>
                <th style="text-align:right;">Open Amount</th>
              </tr>
            </thead>
            <tbody>${content}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadCsv = () => {
    const header = "Customer,Open Items,Total Invoiced,Open Amount";
    const lines = rows.map((row) =>
      [row.customer, row.count, row.invoicedAmount, row.openAmount]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customer-statements.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  };

  const openStatement = async (partnerId) => {
    const statement = await detailMutation.mutateAsync(partnerId);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      return;
    }
    printWindow.document.write(formatStatementHtml(statement));
    printWindow.document.close();
  };

  const downloadStatement = async (partnerId) => {
    const statement = await detailMutation.mutateAsync(partnerId);
    const header = "Invoice,Date,Due Date,State,Payment State,Amount,Balance";
    const lines = statement.entries.map((entry) =>
      [
        entry.name,
        entry.invoice_date || "",
        entry.invoice_date_due || "",
        entry.state || "",
        entry.payment_state || "",
        entry.amount_total,
        entry.amount_residual,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${statement.customer.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-statement.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer statements</CardTitle>
        <CardDescription>Top customer receivable positions for the current management view.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={openPrintableView}
          >
            View
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={downloadCsv}
          >
            Download
          </button>
        </div>
        {visibleRows?.map((row) => (
          <div key={row.customer} className="summary-tile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{row.customer}</p>
                <p className="mt-1 text-sm text-slate-500">{row.count} open invoice items</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Open</p>
                <p className="text-lg font-semibold text-slate-900"><Money value={row.openAmount} /></p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Total invoiced</span>
              <span className="font-semibold text-slate-900"><Money value={row.invoicedAmount} /></span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => openStatement(row.partnerId)} disabled={detailMutation.isPending}>
                View entries
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => downloadStatement(row.partnerId)} disabled={detailMutation.isPending}>
                Download entries
              </Button>
            </div>
          </div>
        ))}
        {detailMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailMutation.error.message}</div> : null}
        {rows?.length > 5 ? (
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "More"}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function UserDashboard({ meta, salesCount, invoiceCount, purchaseCount, salesTotal, recentEntries }) {
  return (
    <>
      <KpiGrid
        items={[
          { label: "Sales Orders", value: salesCount.data ?? 0, helpText: "Current count of sales orders.", to: "/sales" },
          { label: "Customer Invoices", value: invoiceCount.data ?? 0, helpText: "Posted and draft outbound invoices.", to: "/invoices" },
          { label: "Purchase Orders", value: purchaseCount.data ?? 0, helpText: "Vendor purchasing workload.", to: "/purchases" },
          { label: "Sales Volume", value: <Money value={salesTotal.data} />, helpText: "Latest sampled total sales amount.", to: "/sales" },
        ]}
      />

      <Card className="border-red-100 bg-gradient-to-r from-[#7f1d1d] to-[#b91c1c] text-white">
        <CardHeader>
          <CardTitle>Operating mode</CardTitle>
          <CardDescription className="text-red-100">
            REDOXY ERP is the user-facing driver. Odoo remains the secured transaction engine in the background.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Current role</p>
            <p className="mt-1 capitalize text-red-50">{meta.data?.role ?? "Unknown"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Accounting actions</p>
            <p className="mt-1 text-red-50">{meta.data?.permissions?.writeAccounting ? "Enabled" : "Read only"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Odoo engine</p>
            <p className="mt-1 text-red-50">{meta.data?.odooConfigured ? "Connected" : "Not configured"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent journal activity</CardTitle>
          <CardDescription>Latest account moves from your Odoo instance.</CardDescription>
        </CardHeader>
        <CardContent className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-3 py-3">Entry</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">State</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.data?.map((entry) => (
                <tr key={`${entry.name}-${entry.date}`} className="border-b last:border-b-0">
                  <td className="px-3 py-3 font-medium text-slate-900">{entry.name}</td>
                  <td className="px-3 py-3 text-slate-600">{entry.date}</td>
                  <td className="px-3 py-3 capitalize">{entry.state}</td>
                  <td className="px-3 py-3 capitalize">{entry.payment_state || "N/A"}</td>
                  <td className="px-3 py-3"><Money value={entry.amount_total} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <CardContent className="space-y-3 md:hidden">
          {recentEntries.data?.map((entry) => (
            <div key={`${entry.name}-${entry.date}`} className="summary-tile space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900">{entry.name}</p>
                <p className="text-sm font-semibold text-slate-900"><Money value={entry.amount_total} /></p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{entry.date}</span>
                <span className="capitalize">{entry.state}</span>
                <span className="capitalize">{entry.payment_state || "N/A"}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function AdminDashboard({ meta, adminSummary, recentEntries }) {
  const overview = adminSummary.data?.overview;
  const statements = adminSummary.data?.statements;
  const controls = adminSummary.data?.controls;
  const operations = adminSummary.data?.operations;
  const quarter = adminSummary.data?.quarterlyMonitoring;

  return (
    <>
      <KpiGrid
        items={[
          { label: "Total Volume", value: <Money value={overview?.totalSalesVolume} />, helpText: "Closed sales order volume across the recent periods.", to: "/sales" },
          { label: "YTD Revenue", value: <Money value={overview?.ytdRevenue} />, helpText: "Customer invoice revenue booked this year.", to: "/invoices" },
          { label: "Current Receivables", value: <Money value={overview?.currentReceivables} />, helpText: "Open receivable balance still due from customers.", to: "/invoices" },
          { label: "Current Payables", value: <Money value={overview?.currentPayables} />, helpText: "Open payable balance still due to vendors.", to: "/bills" },
          { label: "Payments Received", value: <Money value={overview?.paymentsReceived} />, helpText: "Posted payment activity behind receivable movement.", to: "/invoices" },
          { label: "Net Profit", value: <Money value={overview?.netProfit} />, helpText: "Revenue less direct costs and operating expenses.", to: "/journal-entries" },
        ]}
      />

      <Card className="border-sky-100 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1d4ed8] text-white">
        <CardHeader>
          <CardTitle>Admin command center</CardTitle>
          <CardDescription className="text-sky-100">
            Management view for company performance, cash cycle pressure, and accounting exceptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Current role</p>
            <p className="mt-1 capitalize text-sky-50">{meta.data?.role ?? "Unknown"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Odoo engine</p>
            <p className="mt-1 text-sky-50">{meta.data?.odooConfigured ? "Connected" : "Not configured"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Open exceptions</p>
            <p className="mt-1 text-sky-50">
              {controls?.overdueReceivablesCount ?? 0} receivable, {controls?.overduePayablesCount ?? 0} payable
            </p>
          </div>
        </CardContent>
      </Card>

      <QuarterStrip periods={adminSummary.data?.periods ?? []} />

      <section className="summary-grid">
        <AdminFinanceCard
          title="Latest quarter monitoring"
          description="Quarter-focused aging, invoicing, bill flow, cash position, and payment movement."
          rows={[
            { label: "Aged receivables", value: <Money value={quarter?.agedReceivables} /> },
            { label: "Payments received", value: <Money value={quarter?.paymentsReceived} /> },
            { label: "Invoiced items", value: quarter?.invoicedItems ?? 0 },
            { label: "Bills created", value: quarter?.billsCreated ?? 0 },
            { label: "Cash in hand", value: <Money value={quarter?.cashInHand} /> },
            { label: "Upcoming payments", value: <Money value={quarter?.upcomingPayments} /> },
            { label: "Pending payments", value: <Money value={quarter?.pendingPayments} /> },
            { label: "VAT closed", value: <Money value={quarter?.vatClosed} /> },
            { label: "VAT open", value: <Money value={quarter?.vatOpen} /> },
          ]}
        />
        <WarningPanel warnings={adminSummary.data?.warnings ?? []} operations={operations} />
      </section>

      <MonitoringStrip
        title="Monthly sales trend"
        description="Recent monthly movement for closed sales volume."
        rows={adminSummary.data?.monthly ?? []}
      />
      <MonitoringStrip
        title="Sales by owner"
        description="Top sales ownership view for management follow-up."
        rows={adminSummary.data?.team?.topOwners?.map((row) => ({ ...row, label: row.owner })) ?? []}
      />

      <section className="summary-grid">
        <AdminFinanceCard
          title="Balance sheet view"
          description="Current balance sheet style snapshot for working capital and funding."
          rows={[
            { label: "Current assets", value: <Money value={statements?.balanceSheet?.assetsCurrent} /> },
            { label: "Receivables", value: <Money value={statements?.balanceSheet?.receivables} /> },
            { label: "Current liabilities", value: <Money value={statements?.balanceSheet?.liabilitiesCurrent} /> },
            { label: "Payables", value: <Money value={statements?.balanceSheet?.payables} /> },
            { label: "Equity", value: <Money value={statements?.balanceSheet?.equity} /> },
          ]}
        />
        <AdminFinanceCard
          title="Profit and loss"
          description="Revenue, cost, and expense view for current performance."
          rows={[
            { label: "Revenue", value: <Money value={statements?.profitAndLoss?.revenue} /> },
            { label: "Direct costs", value: <Money value={statements?.profitAndLoss?.directCosts} /> },
            { label: "Operating expenses", value: <Money value={statements?.profitAndLoss?.operatingExpenses} /> },
            { label: "Net profit", value: <Money value={statements?.profitAndLoss?.netProfit} /> },
          ]}
        />
      </section>

      <section className="summary-grid">
        <AdminFinanceCard
          title="Receivables watch"
          description="Current customer collection risk and open receivable position."
          rows={[
            { label: "Current receivables", value: <Money value={overview?.currentReceivables} /> },
            { label: "Overdue receivable count", value: controls?.overdueReceivablesCount ?? 0 },
            { label: "Overdue receivable value", value: <Money value={controls?.overdueReceivablesValue} /> },
          ]}
        />
        <AdminFinanceCard
          title="Payables watch"
          description="Current vendor payment pressure and overdue payable position."
          rows={[
            { label: "Current payables", value: <Money value={overview?.currentPayables} /> },
            { label: "Overdue payable count", value: controls?.overduePayablesCount ?? 0 },
            { label: "Overdue payable value", value: <Money value={controls?.overduePayablesValue} /> },
          ]}
        />
      </section>

      <CustomerStatements rows={adminSummary.data?.customerStatements ?? []} />

      <Card>
        <CardHeader>
          <CardTitle>Finance pulse</CardTitle>
          <CardDescription>Summary of the latest accounting movement without document-level detail.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent entries loaded</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{recentEntries.data?.length ?? 0}</p>
            <p className="mt-2 text-sm text-slate-500">Latest accounting movements shown in the current window.</p>
          </div>
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Latest movement value</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              <Money value={recentEntries.data?.[0]?.amount_total} />
            </p>
            <p className="mt-2 text-sm text-slate-500">Value of the most recent journal move visible to the app.</p>
          </div>
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Posted in latest view</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {recentEntries.data?.filter((entry) => entry.state === "posted").length ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">Posted moves inside the latest sample set.</p>
          </div>
          <div className="summary-tile">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paid in latest view</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {recentEntries.data?.filter((entry) => entry.payment_state === "paid").length ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">Entries fully paid in the latest movement sample.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function Dashboard() {
  const meta = useAppMeta();
  const isAdmin = meta.data?.permissions?.manageSettings;
  const adminSummary = useAdminSummary(Boolean(isAdmin));
  const salesCount = useOdooCount({ queryKey: ["sale-count"], model: "sale.order" });
  const invoiceCount = useOdooCount({ queryKey: ["invoice-count"], model: "account.move", domain: [["move_type", "=", "out_invoice"]] });
  const purchaseCount = useOdooCount({ queryKey: ["purchase-count"], model: "purchase.order" });
  const salesTotal = useOdooAggregate({ queryKey: ["sale-total"], model: "sale.order", field: "amount_total" });
  const recentEntries = useOdooRecords({
    queryKey: ["dashboard-journal"],
    model: "account.move",
    fields: ["name", "date", "state", "amount_total", "payment_state"],
    limit: 6,
  });

  const queries = isAdmin
    ? [meta, adminSummary, recentEntries]
    : [meta, salesCount, invoiceCount, purchaseCount, salesTotal, recentEntries];

  const isLoading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error;

  if (!meta.isLoading && !meta.error && meta.data?.role === "accountant") {
    return <Navigate to="/sales" replace />;
  }

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="REDOXY Live"
        title={isAdmin ? "Executive finance dashboard" : "Business command dashboard"}
        description={
          isAdmin
            ? "Monitor REDOXY volume, receivables, payables, balance sheet pressure, and profit performance from one management workspace."
            : "Track REDOXY commercial volume, invoice load, procurement activity, and recent accounting movement from one controlled interface."
        }
      />

      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error
          ? isAdmin
            ? <AdminDashboard meta={meta} adminSummary={adminSummary} recentEntries={recentEntries} />
            : <UserDashboard meta={meta} salesCount={salesCount} invoiceCount={invoiceCount} purchaseCount={purchaseCount} salesTotal={salesTotal} recentEntries={recentEntries} />
          : null}
      </ConnectionGate>
    </div>
  );
}
