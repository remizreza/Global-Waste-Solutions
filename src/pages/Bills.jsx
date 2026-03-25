import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { apiBinaryRequest, apiRequest } from "@/lib/api";
import { ConnectionGate, DataTableCard, ErrorBlock, KpiGrid, LoadingBlock, Money, PageIntro, useAppMeta, useOdooAggregate, useOdooCount, useOdooRecords } from "@/pages/_helpers";

export default function Bills() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const meta = useAppMeta();
  const canWrite = meta.data?.permissions?.writeAccounting;
  const [form, setForm] = useState({
    partnerId: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    ref: "",
    label: "Vendor line",
    quantity: "1",
    priceUnit: "",
  });

  const total = useOdooCount({ queryKey: ["bills-total"], model: "account.move", domain: [["move_type", "=", "in_invoice"]] });
  const draft = useOdooCount({ queryKey: ["bills-draft"], model: "account.move", domain: [["move_type", "=", "in_invoice"], ["state", "=", "draft"]] });
  const posted = useOdooCount({ queryKey: ["bills-posted"], model: "account.move", domain: [["move_type", "=", "in_invoice"], ["state", "=", "posted"]] });
  const amount = useOdooAggregate({ queryKey: ["bills-amount"], model: "account.move", field: "amount_total", domain: [["move_type", "=", "in_invoice"]] });
  const rows = useOdooRecords({
    queryKey: ["bills-table"],
    model: "account.move",
    fields: ["name", "invoice_date", "partner_id", "payment_state", "amount_total"],
    domain: [["move_type", "=", "in_invoice"]],
    limit: 10,
  });
  const vendors = useOdooRecords({
    queryKey: ["bill-vendors"],
    model: "res.partner",
    fields: ["name"],
    domain: [["supplier_rank", ">", 0]],
    limit: 50,
    order: "name asc",
  });

  const createBillMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/accounting/create-invoice", { method: "POST", token, body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills-total"] });
      queryClient.invalidateQueries({ queryKey: ["bills-draft"] });
      queryClient.invalidateQueries({ queryKey: ["bills-table"] });
    },
  });

  const postBillMutation = useMutation({
    mutationFn: (moveId) => apiRequest("/api/accounting/post-move", { method: "POST", token, body: { moveId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills-posted"] });
      queryClient.invalidateQueries({ queryKey: ["bills-draft"] });
      queryClient.invalidateQueries({ queryKey: ["bills-table"] });
    },
  });
  const printBillMutation = useMutation({
    mutationFn: (billId) => apiBinaryRequest(`/api/accounting/bills/${billId}/print`, { token }),
    onSuccess: ({ blob }) => {
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        window.location.href = url;
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    },
  });
  const downloadBillMutation = useMutation({
    mutationFn: (billId) => apiBinaryRequest(`/api/accounting/bills/${billId}/print`, { token }),
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
  const emailBillMutation = useMutation({
    mutationFn: ({ billId, to }) =>
      apiRequest("/api/documents/email", {
        method: "POST",
        token,
        body: {
          kind: "bill",
          recordId: billId,
          to,
          subject: "REDOXY ERP Vendor Bill PDF",
          message: "Please find the attached vendor bill PDF.",
        },
      }),
  });

  const isLoading = [total, draft, posted, amount, rows].some((query) => query.isLoading);
  const error = [total, draft, posted, amount, rows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Payables" title="Bills" description="Review supplier bills, posting progress, and current payable exposure." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "Vendor Bills", value: total.data ?? 0, helpText: "All inbound invoices." },
                { label: "Draft", value: draft.data ?? 0, helpText: "Bills awaiting posting." },
                { label: "Posted", value: posted.data ?? 0, helpText: "Bills already posted." },
                { label: "Sampled Value", value: <Money value={amount.data} />, helpText: "Latest inbound invoice total." },
              ]}
            />
            <DataTableCard
              title="Latest vendor bills"
              description="Recent supplier bill records."
              columns={[
                { key: "name", label: "Bill" },
                { key: "partner_id", label: "Vendor", render: (value) => value?.[1] ?? "N/A" },
                { key: "invoice_date", label: "Bill Date" },
                { key: "payment_state", label: "Payment State" },
                { key: "amount_total", label: "Amount", render: (value) => <Money value={value} /> },
              ]}
              rows={rows.data ?? []}
            />
            {canWrite ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create draft bill</CardTitle>
                  <CardDescription>Create a simple vendor bill and post it directly from the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="bill-partner">Vendor</Label>
                      <select
                        id="bill-partner"
                        value={form.partnerId}
                        onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Select vendor</option>
                        {vendors.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-date">Bill Date</Label>
                      <Input id="bill-date" type="date" value={form.invoiceDate} onChange={(event) => setForm((current) => ({ ...current, invoiceDate: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-ref">Reference</Label>
                      <Input id="bill-ref" value={form.ref} onChange={(event) => setForm((current) => ({ ...current, ref: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-label">Line Label</Label>
                      <Input id="bill-label" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-qty">Quantity</Label>
                      <Input id="bill-qty" type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill-price">Unit Price</Label>
                      <Input id="bill-price" type="number" min="0" value={form.priceUnit} onChange={(event) => setForm((current) => ({ ...current, priceUnit: event.target.value }))} />
                    </div>
                  </div>
                  <Button type="button" onClick={() => createBillMutation.mutate({ ...form, moveType: "in_invoice" })} disabled={createBillMutation.isPending}>
                    {createBillMutation.isPending ? "Creating..." : "Create Draft Bill"}
                  </Button>
                  {createBillMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createBillMutation.error.message}</div> : null}
                  {createBillMutation.isSuccess ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Draft bill created in Odoo.</div> : null}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-slate-500">
                          <th className="px-3 py-3">Bill</th>
                          <th className="px-3 py-3">Vendor</th>
                          <th className="px-3 py-3">Payment State</th>
                          <th className="px-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.data?.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="px-3 py-3">{row.name}</td>
                            <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                            <td className="px-3 py-3 capitalize">{row.payment_state || "draft"}</td>
                            <td className="px-3 py-3">
                              <Button size="sm" variant="outline" type="button" onClick={() => postBillMutation.mutate(row.id)} disabled={postBillMutation.isPending}>
                                Post
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            <Card>
              <CardHeader>
                <CardTitle>Posted bill documents</CardTitle>
                <CardDescription>View, download, or email supplier bill PDFs served through Odoo.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="px-3 py-3">Bill</th>
                      <th className="px-3 py-3">Vendor</th>
                      <th className="px-3 py-3">Payment State</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.data?.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="px-3 py-3">{row.name}</td>
                        <td className="px-3 py-3">{row.partner_id?.[1] ?? "N/A"}</td>
                        <td className="px-3 py-3 capitalize">{row.payment_state || "draft"}</td>
                        <td className="px-3 py-3"><Money value={row.amount_total} /></td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" type="button" onClick={() => printBillMutation.mutate(row.id)} disabled={printBillMutation.isPending}>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" type="button" onClick={() => downloadBillMutation.mutate(row.id)} disabled={downloadBillMutation.isPending}>
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                const to = window.prompt("Send bill PDF to email address");
                                if (to) {
                                  emailBillMutation.mutate({ billId: row.id, to });
                                }
                              }}
                              disabled={emailBillMutation.isPending}
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
                {printBillMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{printBillMutation.error.message}</div> : null}
                {downloadBillMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{downloadBillMutation.error.message}</div> : null}
                {emailBillMutation.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailBillMutation.error.message}</div> : null}
                {emailBillMutation.isSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Bill email sent successfully.</div> : null}
              </CardContent>
            </Card>
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
