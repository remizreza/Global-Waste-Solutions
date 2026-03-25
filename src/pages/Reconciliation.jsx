import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionGate, ErrorBlock, KpiGrid, LoadingBlock, Money, PageIntro, useOdooAggregate, useOdooCount, useOdooRecords } from "@/pages/_helpers";

export default function Reconciliation() {
  const paidInvoices = useOdooCount({
    queryKey: ["recon-paid-invoices"],
    model: "account.move",
    domain: [["move_type", "=", "out_invoice"], ["payment_state", "=", "paid"]],
  });
  const unpaidInvoices = useOdooCount({
    queryKey: ["recon-unpaid-invoices"],
    model: "account.move",
    domain: [["move_type", "=", "out_invoice"], ["payment_state", "!=", "paid"]],
  });
  const outstandingAmount = useOdooAggregate({
    queryKey: ["recon-outstanding"],
    model: "account.move",
    field: "amount_residual",
    domain: [["move_type", "=", "out_invoice"], ["payment_state", "!=", "paid"]],
  });
  const rows = useOdooRecords({
    queryKey: ["recon-table"],
    model: "account.move",
    fields: ["name", "invoice_date", "partner_id", "payment_state", "amount_residual"],
    domain: [["move_type", "=", "out_invoice"]],
    limit: 12,
  });

  const isLoading = [paidInvoices, unpaidInvoices, outstandingAmount, rows].some((query) => query.isLoading);
  const error = [paidInvoices, unpaidInvoices, outstandingAmount, rows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Cash" title="Reconciliation" description="View paid versus unpaid invoices and highlight outstanding balances." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "Paid Invoices", value: paidInvoices.data ?? 0, helpText: "Invoices already settled." },
                { label: "Open Invoices", value: unpaidInvoices.data ?? 0, helpText: "Invoices still requiring payment." },
                { label: "Outstanding", value: <Money value={outstandingAmount.data} />, helpText: "Current sampled residual amount." },
                { label: "Visible Rows", value: rows.data?.length ?? 0, helpText: "Current reconciliation sample." },
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>Outstanding invoice review</CardTitle>
                <CardDescription>Residual balances grouped by customer invoice.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="px-3 py-3">Invoice</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Payment State</th>
                      <th className="px-3 py-3">Residual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.data?.map((row) => (
                      <tr key={`${row.name}-${row.invoice_date}`} className="border-b last:border-b-0">
                        <td className="px-3 py-3 font-medium">{row.name}</td>
                        <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                        <td className="px-3 py-3">{row.invoice_date || "N/A"}</td>
                        <td className="px-3 py-3 capitalize">{row.payment_state || "N/A"}</td>
                        <td className="px-3 py-3"><Money value={row.amount_residual} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
