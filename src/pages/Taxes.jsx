import { ConnectionGate, DataTableCard, ErrorBlock, KpiGrid, LoadingBlock, PageIntro, useOdooCount, useOdooRecords } from "@/pages/_helpers";

export default function Taxes() {
  const total = useOdooCount({ queryKey: ["tax-total"], model: "account.tax" });
  const sale = useOdooCount({ queryKey: ["tax-sale"], model: "account.tax", domain: [["type_tax_use", "=", "sale"]] });
  const purchase = useOdooCount({ queryKey: ["tax-purchase"], model: "account.tax", domain: [["type_tax_use", "=", "purchase"]] });
  const rows = useOdooRecords({
    queryKey: ["tax-table"],
    model: "account.tax",
    fields: ["name", "amount", "amount_type", "type_tax_use", "active"],
    limit: 12,
  });

  const isLoading = [total, sale, purchase, rows].some((query) => query.isLoading);
  const error = [total, sale, purchase, rows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Compliance" title="Taxes" description="Review configured taxes, their scope, and current active status." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "Tax Rules", value: total.data ?? 0, helpText: "All account tax records." },
                { label: "Sales Taxes", value: sale.data ?? 0, helpText: "Taxes used on sales." },
                { label: "Purchase Taxes", value: purchase.data ?? 0, helpText: "Taxes used on purchases." },
                { label: "Visible Rows", value: rows.data?.length ?? 0, helpText: "Current table sample size." },
              ]}
            />
            <DataTableCard
              title="Tax configuration"
              description="Latest tax records from Odoo."
              columns={[
                { key: "name", label: "Name" },
                { key: "amount", label: "Rate" },
                { key: "amount_type", label: "Type" },
                { key: "type_tax_use", label: "Usage" },
                { key: "active", label: "Active", render: (value) => (value ? "Yes" : "No") },
              ]}
              rows={rows.data ?? []}
            />
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
