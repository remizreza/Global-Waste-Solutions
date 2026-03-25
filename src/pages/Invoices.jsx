import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Plus, Send, Trash2, Upload } from "lucide-react";
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

export default function Invoices() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const meta = useAppMeta();
  const canWrite = meta.data?.permissions?.writeAccounting;
  const [form, setForm] = useState({
    partnerId: "",
    pricelistId: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    ref: "",
    invoiceOrigin: "",
    customerEmail: "",
    lines: [emptyLine()],
  });

  const total = useOdooCount({ queryKey: ["invoices-total"], model: "account.move", domain: [["move_type", "=", "out_invoice"]] });
  const draft = useOdooCount({ queryKey: ["invoices-draft"], model: "account.move", domain: [["move_type", "=", "out_invoice"], ["state", "=", "draft"]] });
  const posted = useOdooCount({ queryKey: ["invoices-posted"], model: "account.move", domain: [["move_type", "=", "out_invoice"], ["state", "=", "posted"]] });
  const amount = useOdooAggregate({ queryKey: ["invoices-amount"], model: "account.move", field: "amount_total", domain: [["move_type", "=", "out_invoice"]] });
  const recentRows = useOdooRecords({
    queryKey: ["invoices-table"],
    model: "account.move",
    fields: ["id", "name", "invoice_date", "partner_id", "payment_state", "amount_total", "state"],
    domain: [["move_type", "=", "out_invoice"]],
    limit: 10,
  });
  const draftRows = useOdooRecords({
    queryKey: ["invoice-draft-table"],
    model: "account.move",
    fields: ["id", "name", "invoice_date", "partner_id", "amount_total", "state"],
    domain: [["move_type", "=", "out_invoice"], ["state", "=", "draft"]],
    limit: 12,
  });
  const postedRows = useOdooRecords({
    queryKey: ["invoice-posted-table"],
    model: "account.move",
    fields: ["id", "name", "invoice_date", "partner_id", "amount_total", "payment_state", "state"],
    domain: [["move_type", "=", "out_invoice"], ["state", "=", "posted"]],
    limit: 12,
  });

  const customers = useOdooRecords({
    queryKey: ["invoice-customers"],
    model: "res.partner",
    fields: ["id", "name", "email", "property_product_pricelist"],
    domain: [["customer_rank", ">", 0]],
    limit: 80,
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

  const createInvoiceMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/accounting/create-invoice", { method: "POST", token, body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-total"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-draft"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-table"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-draft-table"] });
      setForm((current) => ({
        ...current,
        ref: "",
        invoiceOrigin: "",
        lines: [emptyLine()],
      }));
    },
  });

  const postInvoiceMutation = useMutation({
    mutationFn: (moveId) => apiRequest("/api/accounting/post-move", { method: "POST", token, body: { moveId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-posted"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-draft"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-table"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-draft-table"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-posted-table"] });
    },
  });

  const pricePreviewMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/catalog/price-preview", { method: "POST", token, body: payload }),
  });

  const printInvoiceMutation = useMutation({
    mutationFn: (invoiceId) => apiBinaryRequest(`/api/accounting/invoices/${invoiceId}/print`, { token }),
    onSuccess: ({ blob }) => {
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        window.location.href = url;
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    },
  });

  const downloadInvoiceMutation = useMutation({
    mutationFn: (invoiceId) => apiBinaryRequest(`/api/accounting/invoices/${invoiceId}/print`, { token }),
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
  const emailInvoiceMutation = useMutation({
    mutationFn: ({ invoiceId, to }) =>
      apiRequest("/api/documents/email", {
        method: "POST",
        token,
        body: {
          kind: "invoice",
          recordId: invoiceId,
          to,
          subject: "REDOXY ERP Invoice PDF",
          message: "Please find your invoice attached.",
        },
      }),
  });
  const uploadInvoiceMutation = useMutation({
    mutationFn: (invoiceId) =>
      apiRequest("/api/documents/upload", {
        method: "POST",
        token,
        body: {
          kind: "invoice",
          recordId: invoiceId,
        },
      }),
    onSuccess: ({ file }) => {
      if (file?.webViewLink) {
        window.open(file.webViewLink, "_blank", "noopener,noreferrer");
      }
    },
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
      customerEmail: selectedCustomer.email || current.customerEmail,
      pricelistId: current.pricelistId || String(selectedCustomer.property_product_pricelist?.[0] || ""),
    }));
  }, [selectedCustomer]);

  const handleLineChange = (index, key, value) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)),
    }));
  };

  const addLine = () => {
    setForm((current) => ({ ...current, lines: [...current.lines, emptyLine()] }));
  };

  const removeLine = (index) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.length === 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index),
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
    () =>
      form.lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.priceUnit || 0), 0),
    [form.lines],
  );

  const isLoading = [total, draft, posted, amount, recentRows, draftRows, postedRows].some((query) => query.isLoading);
  const error = [total, draft, posted, amount, recentRows, draftRows, postedRows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Receivables"
        title="Customer invoices"
        description="Create, review, post, and distribute customer invoices with REDOXY-controlled workflows while Odoo stays underneath as the transaction engine."
      />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "Customer Invoices", value: total.data ?? 0, helpText: "All outbound invoices." },
                { label: "Draft Queue", value: draft.data ?? 0, helpText: "Draft invoices ready for review and posting." },
                { label: "Posted", value: posted.data ?? 0, helpText: "Invoices already posted." },
                { label: "Revenue Sample", value: <Money value={amount.data} />, helpText: "Latest outbound invoice total." },
              ]}
            />

            <DataTableCard
              title="Recent invoice activity"
              description="Latest customer invoices across draft and posted states."
              columns={[
                { key: "name", label: "Invoice" },
                { key: "partner_id", label: "Customer", render: (value) => value?.[1] ?? "N/A" },
                { key: "invoice_date", label: "Invoice Date" },
                { key: "state", label: "State" },
                { key: "amount_total", label: "Amount", render: (value) => <Money value={value} /> },
              ]}
              rows={recentRows.data ?? []}
            />

            {canWrite ? (
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle>Create invoice draft</CardTitle>
                  <CardDescription>Use customer, pricelist, and product lines so daily invoicing feels closer to a dedicated REDOXY ERP workflow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-partner">Customer</Label>
                      <select
                        id="invoice-partner"
                        value={form.partnerId}
                        onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Select customer</option>
                        {customers.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-pricelist">Pricelist</Label>
                      <select
                        id="invoice-pricelist"
                        value={form.pricelistId}
                        onChange={(event) => setForm((current) => ({ ...current, pricelistId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Default / list price</option>
                        {pricelists.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-date">Invoice Date</Label>
                      <Input id="invoice-date" type="date" value={form.invoiceDate} onChange={(event) => setForm((current) => ({ ...current, invoiceDate: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-email">Customer Email</Label>
                      <Input id="invoice-email" value={form.customerEmail} onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))} placeholder="customer@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-ref">Reference</Label>
                      <Input id="invoice-ref" value={form.ref} onChange={(event) => setForm((current) => ({ ...current, ref: event.target.value }))} placeholder="PO / project / contract" />
                    </div>
                    <div className="space-y-2 xl:col-span-3">
                      <Label htmlFor="invoice-origin">Origin / Note</Label>
                      <Input id="invoice-origin" value={form.invoiceOrigin} onChange={(event) => setForm((current) => ({ ...current, invoiceOrigin: event.target.value }))} placeholder="Sales rep, project, contract or internal note" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {form.lines.map((line, index) => (
                      <div key={`line-${index}`} className="rounded-3xl border bg-slate-50/70 p-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto]">
                          <div className="space-y-2">
                            <Label>Product / service</Label>
                            <select
                              value={line.productId}
                              onChange={(event) => applyProduct(index, event.target.value)}
                              className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                            >
                              <option value="">Select product</option>
                              {products.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.default_code ? `${item.default_code} - ` : ""}{item.display_name || item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={line.label} onChange={(event) => handleLineChange(index, "label", event.target.value)} placeholder="Invoice line description" />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(event) => handleLineChange(index, "quantity", event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              value={line.priceUnit}
                              onChange={(event) => handleLineChange(index, "priceUnit", event.target.value)}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="outline" size="sm" onClick={() => removeLine(index)}>
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addLine}>
                      <Plus className="h-4 w-4" />
                      Add line
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-slate-900 px-5 py-4 text-white">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Estimated total</p>
                      <p className="mt-1 text-2xl font-bold"><Money value={linesTotal} /></p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => createInvoiceMutation.mutate({ ...form, moveType: "out_invoice" })}
                      disabled={createInvoiceMutation.isPending}
                    >
                      {createInvoiceMutation.isPending ? "Creating..." : "Create Draft Invoice"}
                    </Button>
                  </div>

                  {pricePreviewMutation.error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Pricelist preview fallback used. Odoo returned a pricing method error for this product.</div> : null}
                  {createInvoiceMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createInvoiceMutation.error.message}</div> : null}
                  {createInvoiceMutation.isSuccess ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Draft invoice created in Odoo.</div> : null}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Drafts ready for review</CardTitle>
                  <CardDescription>Review draft invoices before posting.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="px-3 py-3">Invoice</th>
                        <th className="px-3 py-3">Customer</th>
                        <th className="px-3 py-3">Date</th>
                        <th className="px-3 py-3">Amount</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftRows.data?.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0">
                          <td className="px-3 py-3 font-medium">{row.name}</td>
                          <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                          <td className="px-3 py-3">{row.invoice_date || "N/A"}</td>
                          <td className="px-3 py-3"><Money value={row.amount_total} /></td>
                          <td className="px-3 py-3">
                            {canWrite ? (
                              <Button size="sm" variant="outline" type="button" onClick={() => postInvoiceMutation.mutate(row.id)} disabled={postInvoiceMutation.isPending}>
                                Post
                              </Button>
                            ) : (
                              "Review only"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Posted invoices</CardTitle>
                  <CardDescription>View, download, email, or upload customer invoice PDFs fetched live from Odoo through the REDOXY backend.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="px-3 py-3">Invoice</th>
                        <th className="px-3 py-3">Customer</th>
                        <th className="px-3 py-3">Amount</th>
                        <th className="px-3 py-3">Payment</th>
                        <th className="px-3 py-3">Workflow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postedRows.data?.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0">
                          <td className="px-3 py-3 font-medium">{row.name}</td>
                          <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                          <td className="px-3 py-3"><Money value={row.amount_total} /></td>
                          <td className="px-3 py-3 capitalize">{row.payment_state || "not paid"}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" type="button" onClick={() => printInvoiceMutation.mutate(row.id)} disabled={printInvoiceMutation.isPending}>
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" type="button" onClick={() => downloadInvoiceMutation.mutate(row.id)} disabled={downloadInvoiceMutation.isPending}>
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => uploadInvoiceMutation.mutate(row.id)}
                                disabled={uploadInvoiceMutation.isPending}
                              >
                                <Upload className="h-4 w-4" />
                                Drive
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => {
                                  const to = window.prompt("Send invoice PDF to email address");
                                  if (to) {
                                    emailInvoiceMutation.mutate({ invoiceId: row.id, to });
                                  }
                                }}
                                disabled={emailInvoiceMutation.isPending}
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
                  {printInvoiceMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{printInvoiceMutation.error.message}</div> : null}
                  {downloadInvoiceMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{downloadInvoiceMutation.error.message}</div> : null}
                  {uploadInvoiceMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadInvoiceMutation.error.message}</div> : null}
                  {emailInvoiceMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailInvoiceMutation.error.message}</div> : null}
                  {uploadInvoiceMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">Invoice uploaded to Google Drive.</div> : null}
                  {emailInvoiceMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Invoice email sent successfully.</div> : null}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
