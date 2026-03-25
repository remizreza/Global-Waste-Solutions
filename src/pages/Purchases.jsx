import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { apiBinaryRequest, apiRequest } from "@/lib/api";
import { ConnectionGate, DataTableCard, ErrorBlock, KpiGrid, LoadingBlock, Money, PageIntro, useAppMeta, useOdooAggregate, useOdooCount, useOdooRecords } from "@/pages/_helpers";

function emptyLine() {
  return {
    productId: "",
    label: "",
    quantity: "1",
    priceUnit: "",
    taxesIds: [],
    uomId: "",
  };
}

export default function Purchases() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const meta = useAppMeta();
  const canWrite = meta.data?.permissions?.writeAccounting;
  const [form, setForm] = useState({
    partnerId: "",
    dateOrder: new Date().toISOString().slice(0, 10),
    vendorReference: "",
    notes: "",
    lines: [emptyLine()],
  });

  const total = useOdooCount({ queryKey: ["purchase-total"], model: "purchase.order" });
  const draft = useOdooCount({ queryKey: ["purchase-draft"], model: "purchase.order", domain: [["state", "=", "draft"]] });
  const confirmed = useOdooCount({ queryKey: ["purchase-confirmed"], model: "purchase.order", domain: [["state", "in", ["purchase", "done"]]] });
  const totalValue = useOdooAggregate({ queryKey: ["purchase-value"], model: "purchase.order", field: "amount_total" });
  const rows = useOdooRecords({
    queryKey: ["purchase-table"],
    model: "purchase.order",
    fields: ["id", "name", "partner_id", "date_order", "state", "amount_total"],
    limit: 12,
  });
  const vendors = useOdooRecords({
    queryKey: ["purchase-vendors"],
    model: "res.partner",
    fields: ["id", "name"],
    domain: [["supplier_rank", ">", 0]],
    limit: 100,
    order: "name asc",
  });
  const productsQuery = useQuery({
    queryKey: ["catalog-products"],
    queryFn: () => apiRequest("/api/catalog/products", { token }),
  });

  const products = productsQuery.data?.rows ?? [];

  const createOrderMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/purchases/create-order", { method: "POST", token, body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-total"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-draft"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-table"] });
      setForm((current) => ({ ...current, vendorReference: "", notes: "", lines: [emptyLine()] }));
    },
  });
  const confirmOrderMutation = useMutation({
    mutationFn: (orderId) => apiRequest("/api/purchases/confirm-order", { method: "POST", token, body: { orderId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-total"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-draft"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-confirmed"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-table"] });
    },
  });
  const printOrderMutation = useMutation({
    mutationFn: (orderId) => apiBinaryRequest(`/api/purchases/orders/${orderId}/print`, { token }),
    onSuccess: ({ blob }) => {
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        window.location.href = url;
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    },
  });
  const downloadOrderMutation = useMutation({
    mutationFn: (orderId) => apiBinaryRequest(`/api/purchases/orders/${orderId}/print`, { token }),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    },
  });
  const emailOrderMutation = useMutation({
    mutationFn: ({ orderId, to }) =>
      apiRequest("/api/documents/email", {
        method: "POST",
        token,
        body: {
          kind: "purchase_order",
          recordId: orderId,
          to,
          subject: "REDOXY ERP RFQ / Purchase Order PDF",
          message: "Please find the attached RFQ or purchase order PDF.",
        },
      }),
  });

  const applyProduct = (lineIndex, productId) => {
    const product = products.find((item) => String(item.id) === String(productId));
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, currentIndex) =>
        currentIndex === lineIndex
          ? {
              ...line,
              productId,
              label: product?.display_name || product?.name || "",
              priceUnit: String(product?.list_price ?? ""),
              taxesIds: product?.taxes_id ?? [],
              uomId: String(product?.uom_id?.[0] || ""),
            }
          : line,
      ),
    }));
  };

  const linesTotal = useMemo(
    () => form.lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.priceUnit || 0), 0),
    [form.lines],
  );

  const isLoading = [total, draft, confirmed, totalValue, rows].some((query) => query.isLoading);
  const error = [total, draft, confirmed, totalValue, rows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Spend" title="Purchases" description="Create RFQs, confirm purchase orders, and monitor recent procurement activity." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "Purchase Orders", value: total.data ?? 0, helpText: "All purchase orders in the system." },
                { label: "Draft RFQs", value: draft.data ?? 0, helpText: "Procurement still in draft RFQ stage." },
                { label: "Confirmed", value: confirmed.data ?? 0, helpText: "Orders already approved." },
                { label: "Sampled Value", value: <Money value={totalValue.data} />, helpText: "Total from the visible purchase orders." },
              ]}
            />
            <DataTableCard
              title="Recent purchase orders"
              description="Latest procurement records from Odoo."
              columns={[
                { key: "name", label: "Order" },
                { key: "partner_id", label: "Vendor", render: (value) => value?.[1] ?? "N/A" },
                { key: "date_order", label: "Order Date" },
                { key: "state", label: "State" },
                { key: "amount_total", label: "Amount", render: (value) => <Money value={value} /> },
              ]}
              rows={rows.data ?? []}
            />

            {canWrite ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create RFQ</CardTitle>
                  <CardDescription>Create a draft RFQ first, then confirm it to a purchase order when ready.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase-vendor">Vendor</Label>
                      <select id="purchase-vendor" value={form.partnerId} onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))} className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base">
                        <option value="">Select vendor</option>
                        {vendors.data?.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase-date">RFQ Date</Label>
                      <Input id="purchase-date" type="date" value={form.dateOrder} onChange={(event) => setForm((current) => ({ ...current, dateOrder: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase-ref">Vendor Ref</Label>
                      <Input id="purchase-ref" value={form.vendorReference} onChange={(event) => setForm((current) => ({ ...current, vendorReference: event.target.value }))} placeholder="Quote / reference number" />
                    </div>
                    <div className="space-y-2 xl:col-span-4">
                      <Label htmlFor="purchase-note">Notes</Label>
                      <Input id="purchase-note" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Vendor note or internal instruction" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {form.lines.map((line, index) => (
                      <div key={`line-${index}`} className="rounded-3xl border bg-slate-50/70 p-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto]">
                          <div className="space-y-2">
                            <Label>Product</Label>
                            <select value={line.productId} onChange={(event) => applyProduct(index, event.target.value)} className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base">
                              <option value="">Select product</option>
                              {products.map((item) => (
                                <option key={item.id} value={item.id}>{item.default_code ? `${item.default_code} - ` : ""}{item.display_name || item.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={line.label} onChange={(event) => setForm((current) => ({ ...current, lines: current.lines.map((currentLine, currentIndex) => (currentIndex === index ? { ...currentLine, label: event.target.value } : currentLine)) }))} placeholder="RFQ line description" />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input type="number" min="1" value={line.quantity} onChange={(event) => setForm((current) => ({ ...current, lines: current.lines.map((currentLine, currentIndex) => (currentIndex === index ? { ...currentLine, quantity: event.target.value } : currentLine)) }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price</Label>
                            <Input type="number" min="0" value={line.priceUnit} onChange={(event) => setForm((current) => ({ ...current, lines: current.lines.map((currentLine, currentIndex) => (currentIndex === index ? { ...currentLine, priceUnit: event.target.value } : currentLine)) }))} />
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="outline" size="sm" onClick={() => setForm((current) => ({ ...current, lines: current.lines.length === 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index) }))}>
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, lines: [...current.lines, emptyLine()] }))}>
                      <Plus className="h-4 w-4" />
                      Add line
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-slate-900 px-5 py-4 text-white">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-300">RFQ total</p>
                      <p className="mt-1 text-2xl font-bold"><Money value={linesTotal} /></p>
                    </div>
                    <Button type="button" onClick={() => createOrderMutation.mutate(form)} disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? "Creating..." : "Create Draft RFQ"}
                    </Button>
                  </div>

                  {createOrderMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createOrderMutation.error.message}</div> : null}
                  {createOrderMutation.isSuccess ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Draft RFQ created in Odoo.</div> : null}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>RFQ and purchase order documents</CardTitle>
                <CardDescription>View, confirm, download, or email the RFQ / purchase order generated from Odoo.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="px-3 py-3">Order</th>
                      <th className="px-3 py-3">Vendor</th>
                      <th className="px-3 py-3">State</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.data?.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="px-3 py-3 font-medium">{row.name}</td>
                        <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                        <td className="px-3 py-3 capitalize">{row.state}</td>
                        <td className="px-3 py-3"><Money value={row.amount_total} /></td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            {canWrite && row.state === "draft" ? (
                              <Button size="sm" variant="outline" type="button" onClick={() => confirmOrderMutation.mutate(row.id)} disabled={confirmOrderMutation.isPending}>
                                Confirm
                              </Button>
                            ) : null}
                            <Button size="sm" variant="outline" type="button" onClick={() => printOrderMutation.mutate(row.id)} disabled={printOrderMutation.isPending}>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" type="button" onClick={() => downloadOrderMutation.mutate(row.id)} disabled={downloadOrderMutation.isPending}>
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                const to = window.prompt("Send RFQ / purchase order PDF to email address");
                                if (to) {
                                  emailOrderMutation.mutate({ orderId: row.id, to });
                                }
                              }}
                              disabled={emailOrderMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                              Email
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {confirmOrderMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{confirmOrderMutation.error.message}</div> : null}
                {printOrderMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{printOrderMutation.error.message}</div> : null}
                {downloadOrderMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{downloadOrderMutation.error.message}</div> : null}
                {emailOrderMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailOrderMutation.error.message}</div> : null}
                {confirmOrderMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">RFQ confirmed in Odoo.</div> : null}
                {emailOrderMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">RFQ / purchase order email sent successfully.</div> : null}
              </CardContent>
            </Card>
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
