import { useEffect, useMemo, useState } from "react";
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
  };
}

export default function Sales() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const meta = useAppMeta();
  const canWrite = meta.data?.permissions?.writeAccounting;
  const [form, setForm] = useState({
    partnerId: "",
    pricelistId: "",
    dateOrder: new Date().toISOString().slice(0, 10),
    clientReference: "",
    note: "",
    lines: [emptyLine()],
  });

  const totalOrders = useOdooCount({ queryKey: ["sales-orders"], model: "sale.order" });
  const quotationCount = useOdooCount({ queryKey: ["sales-quotations"], model: "sale.order", domain: [["state", "=", "draft"]] });
  const confirmedCount = useOdooCount({ queryKey: ["sales-confirmed"], model: "sale.order", domain: [["state", "in", ["sale", "done"]]] });
  const amountTotal = useOdooAggregate({ queryKey: ["sales-amount"], model: "sale.order", field: "amount_total" });
  const orders = useOdooRecords({
    queryKey: ["sales-table"],
    model: "sale.order",
    fields: ["id", "name", "partner_id", "date_order", "state", "amount_total"],
    limit: 12,
  });
  const customers = useOdooRecords({
    queryKey: ["sales-customers"],
    model: "res.partner",
    fields: ["id", "name", "property_product_pricelist"],
    domain: [["customer_rank", ">", 0]],
    limit: 100,
    order: "name asc",
  });
  const productsQuery = useQuery({
    queryKey: ["catalog-products"],
    queryFn: () => apiRequest("/api/catalog/products", { token }),
  });
  const pricelistsQuery = useQuery({
    queryKey: ["catalog-pricelists"],
    queryFn: () => apiRequest("/api/catalog/pricelists", { token }),
  });

  const products = productsQuery.data?.rows ?? [];
  const pricelists = pricelistsQuery.data?.rows ?? [];

  const createOrderMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/sales/create-order", { method: "POST", token, body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["sales-table"] });
      setForm((current) => ({ ...current, clientReference: "", note: "", lines: [emptyLine()] }));
    },
  });
  const confirmOrderMutation = useMutation({
    mutationFn: (orderId) => apiRequest("/api/sales/confirm-order", { method: "POST", token, body: { orderId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["sales-confirmed"] });
      queryClient.invalidateQueries({ queryKey: ["sales-table"] });
    },
  });
  const pricePreviewMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/catalog/price-preview", { method: "POST", token, body: payload }),
  });
  const printOrderMutation = useMutation({
    mutationFn: (orderId) => apiBinaryRequest(`/api/sales/orders/${orderId}/print`, { token }),
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
    mutationFn: (orderId) => apiBinaryRequest(`/api/sales/orders/${orderId}/print`, { token }),
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
          kind: "sale_order",
          recordId: orderId,
          to,
          subject: "REDOXY ERP Quotation / Sales Order PDF",
          message: "Please find the attached quotation or sales order PDF.",
        },
      }),
  });

  const selectedCustomer = useMemo(
    () => customers.data?.find((item) => String(item.id) === String(form.partnerId)),
    [customers.data, form.partnerId],
  );

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    setForm((current) => ({
      ...current,
      pricelistId: current.pricelistId || String(selectedCustomer.property_product_pricelist?.[0] || ""),
    }));
  }, [selectedCustomer]);

  const handleLineChange = (index, key, value) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)),
    }));
  };

  const applyProduct = async (lineIndex, productId) => {
    const product = products.find((item) => String(item.id) === String(productId));
    handleLineChange(lineIndex, "productId", productId);
    handleLineChange(lineIndex, "label", product?.display_name || product?.name || "");

    try {
      const preview = await pricePreviewMutation.mutateAsync({
        productId,
        pricelistId: form.pricelistId || undefined,
        quantity: form.lines[lineIndex].quantity || 1,
      });
      setForm((current) => ({
        ...current,
        lines: current.lines.map((line, currentIndex) =>
          currentIndex === lineIndex
            ? {
                ...line,
                productId,
                label: preview.row.name || product?.display_name || product?.name || "",
                priceUnit: String(preview.row.priceUnit ?? product?.list_price ?? ""),
                taxesIds: preview.row.taxesId ?? [],
              }
            : line,
        ),
      }));
    } catch {
      setForm((current) => ({
        ...current,
        lines: current.lines.map((line, currentIndex) =>
          currentIndex === lineIndex
            ? {
                ...line,
                productId,
                label: product?.display_name || product?.name || "",
                priceUnit: String(product?.list_price ?? ""),
              }
            : line,
        ),
      }));
    }
  };

  const linesTotal = useMemo(
    () => form.lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.priceUnit || 0), 0),
    [form.lines],
  );

  const isLoading = [totalOrders, quotationCount, confirmedCount, amountTotal, orders].some((query) => query.isLoading);
  const error = [totalOrders, quotationCount, confirmedCount, amountTotal, orders].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Revenue" title="Sales" description="Create quotations, confirm sales orders, and review current commercial volume." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "All Orders", value: totalOrders.data ?? 0, helpText: "All sales orders in Odoo." },
                { label: "Draft Quotations", value: quotationCount.data ?? 0, helpText: "Orders still under review." },
                { label: "Confirmed Orders", value: confirmedCount.data ?? 0, helpText: "Orders already confirmed." },
                { label: "Sampled Value", value: <Money value={amountTotal.data} />, helpText: "Total from the visible orders." },
              ]}
            />
            <DataTableCard
              title="Latest sales orders"
              description="Recent sales orders pulled directly from Odoo."
              columns={[
                { key: "name", label: "Order" },
                { key: "partner_id", label: "Customer", render: (value) => value?.[1] ?? "N/A" },
                { key: "date_order", label: "Order Date" },
                { key: "state", label: "State" },
                { key: "amount_total", label: "Amount", render: (value) => <Money value={value} /> },
              ]}
              rows={orders.data ?? []}
            />

            {canWrite ? (
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle>Create quotation</CardTitle>
                  <CardDescription>Create a quotation first, then confirm it to keep the sales workflow close to Odoo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="sales-customer">Customer</Label>
                      <select id="sales-customer" value={form.partnerId} onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))} className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base">
                        <option value="">Select customer</option>
                        {customers.data?.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales-pricelist">Pricelist</Label>
                      <select id="sales-pricelist" value={form.pricelistId} onChange={(event) => setForm((current) => ({ ...current, pricelistId: event.target.value }))} className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base">
                        <option value="">Default / list price</option>
                        {pricelists.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales-date">Quotation Date</Label>
                      <Input id="sales-date" type="date" value={form.dateOrder} onChange={(event) => setForm((current) => ({ ...current, dateOrder: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales-ref">Customer Ref</Label>
                      <Input id="sales-ref" value={form.clientReference} onChange={(event) => setForm((current) => ({ ...current, clientReference: event.target.value }))} placeholder="PO / tender / contract" />
                    </div>
                    <div className="space-y-2 xl:col-span-4">
                      <Label htmlFor="sales-note">Note</Label>
                      <Input id="sales-note" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Optional internal or customer-facing note" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {form.lines.map((line, index) => (
                      <div key={`line-${index}`} className="rounded-3xl border bg-slate-50/70 p-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto]">
                          <div className="space-y-2">
                            <Label>Product / service</Label>
                            <select value={line.productId} onChange={(event) => applyProduct(index, event.target.value)} className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base">
                              <option value="">Select product</option>
                              {products.map((item) => (
                                <option key={item.id} value={item.id}>{item.default_code ? `${item.default_code} - ` : ""}{item.display_name || item.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={line.label} onChange={(event) => handleLineChange(index, "label", event.target.value)} placeholder="Quotation line description" />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input type="number" min="1" value={line.quantity} onChange={(event) => handleLineChange(index, "quantity", event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price</Label>
                            <Input type="number" min="0" value={line.priceUnit} onChange={(event) => handleLineChange(index, "priceUnit", event.target.value)} />
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
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Quotation total</p>
                      <p className="mt-1 text-2xl font-bold"><Money value={linesTotal} /></p>
                    </div>
                    <Button type="button" onClick={() => createOrderMutation.mutate(form)} disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? "Creating..." : "Create Draft Quotation"}
                    </Button>
                  </div>

                  {pricePreviewMutation.error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Pricelist preview fallback used for one or more products.</div> : null}
                  {createOrderMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createOrderMutation.error.message}</div> : null}
                  {createOrderMutation.isSuccess ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Draft quotation created in Odoo.</div> : null}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Quotation and order documents</CardTitle>
                <CardDescription>View, confirm, download, or email the current sales document generated by Odoo.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="px-3 py-3">Order</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">State</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.data?.map((row) => (
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
                                const to = window.prompt("Send quotation / order PDF to email address");
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
                {confirmOrderMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Quotation confirmed in Odoo.</div> : null}
                {emailOrderMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Quotation / order email sent successfully.</div> : null}
              </CardContent>
            </Card>
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
