import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest } from "@/lib/api";
import { ConnectionGate, DataTableCard, ErrorBlock, KpiGrid, LoadingBlock, Money, PageIntro, useAppMeta, useOdooCount, useOdooRecords } from "@/pages/_helpers";

export default function JournalEntries() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const meta = useAppMeta();
  const canWrite = meta.data?.permissions?.writeAccounting;
  const [form, setForm] = useState({
    journalId: "",
    date: new Date().toISOString().slice(0, 10),
    ref: "",
    debitAccountId: "",
    creditAccountId: "",
    amount: "",
    label: "Manual entry",
  });

  const total = useOdooCount({ queryKey: ["journal-total"], model: "account.move" });
  const draft = useOdooCount({ queryKey: ["journal-draft"], model: "account.move", domain: [["state", "=", "draft"]] });
  const posted = useOdooCount({ queryKey: ["journal-posted"], model: "account.move", domain: [["state", "=", "posted"]] });
  const rows = useOdooRecords({
    queryKey: ["journal-table"],
    model: "account.move",
    fields: ["name", "date", "journal_id", "state", "amount_total"],
    limit: 12,
  });
  const journals = useOdooRecords({
    queryKey: ["journals-list"],
    model: "account.journal",
    fields: ["name"],
    limit: 50,
    order: "name asc",
  });
  const accounts = useOdooRecords({
    queryKey: ["accounts-list"],
    model: "account.account",
    fields: ["name", "code"],
    limit: 100,
    order: "code asc",
  });

  const createEntryMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/accounting/create-entry", { method: "POST", token, body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-total"] });
      queryClient.invalidateQueries({ queryKey: ["journal-draft"] });
      queryClient.invalidateQueries({ queryKey: ["journal-table"] });
    },
  });

  const postEntryMutation = useMutation({
    mutationFn: (moveId) => apiRequest("/api/accounting/post-move", { method: "POST", token, body: { moveId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-posted"] });
      queryClient.invalidateQueries({ queryKey: ["journal-draft"] });
      queryClient.invalidateQueries({ queryKey: ["journal-table"] });
    },
  });

  const isLoading = [total, draft, posted, rows].some((query) => query.isLoading);
  const error = [total, draft, posted, rows].find((query) => query.error)?.error;

  return (
    <div className="page-shell">
      <PageIntro eyebrow="Ledger" title="Journal Entries" description="Inspect account moves, journal allocations, and posting status." />
      <ConnectionGate>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock error={error} /> : null}
        {!isLoading && !error ? (
          <>
            <KpiGrid
              items={[
                { label: "All Entries", value: total.data ?? 0, helpText: "Total account moves." },
                { label: "Draft Entries", value: draft.data ?? 0, helpText: "Unposted records." },
                { label: "Posted Entries", value: posted.data ?? 0, helpText: "Validated journal entries." },
                { label: "Visible Rows", value: rows.data?.length ?? 0, helpText: "Current table sample size." },
              ]}
            />
            <DataTableCard
              title="Recent journal entries"
              description="Latest account moves from Odoo."
              columns={[
                { key: "name", label: "Entry" },
                { key: "date", label: "Date" },
                { key: "journal_id", label: "Journal", render: (value) => value?.[1] ?? "N/A" },
                { key: "state", label: "State" },
                { key: "amount_total", label: "Amount", render: (value) => <Money value={value} /> },
              ]}
              rows={rows.data ?? []}
            />
            {canWrite ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create balanced journal entry</CardTitle>
                  <CardDescription>Create a draft manual journal entry with one debit line and one credit line.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="entry-journal">Journal</Label>
                      <select
                        id="entry-journal"
                        value={form.journalId}
                        onChange={(event) => setForm((current) => ({ ...current, journalId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Select journal</option>
                        {journals.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-date">Date</Label>
                      <Input id="entry-date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-ref">Reference</Label>
                      <Input id="entry-ref" value={form.ref} onChange={(event) => setForm((current) => ({ ...current, ref: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-debit">Debit Account</Label>
                      <select
                        id="entry-debit"
                        value={form.debitAccountId}
                        onChange={(event) => setForm((current) => ({ ...current, debitAccountId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Select account</option>
                        {accounts.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.code} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-credit">Credit Account</Label>
                      <select
                        id="entry-credit"
                        value={form.creditAccountId}
                        onChange={(event) => setForm((current) => ({ ...current, creditAccountId: event.target.value }))}
                        className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base"
                      >
                        <option value="">Select account</option>
                        {accounts.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.code} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry-amount">Amount</Label>
                      <Input id="entry-amount" type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
                    </div>
                    <div className="space-y-2 xl:col-span-3">
                      <Label htmlFor="entry-label">Line Label</Label>
                      <Input id="entry-label" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
                    </div>
                  </div>
                  <Button type="button" onClick={() => createEntryMutation.mutate(form)} disabled={createEntryMutation.isPending}>
                    {createEntryMutation.isPending ? "Creating..." : "Create Draft Entry"}
                  </Button>
                  {createEntryMutation.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createEntryMutation.error.message}</div> : null}
                  {createEntryMutation.isSuccess ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Draft journal entry created in Odoo.</div> : null}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-slate-500">
                          <th className="px-3 py-3">Entry</th>
                          <th className="px-3 py-3">Journal</th>
                          <th className="px-3 py-3">State</th>
                          <th className="px-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.data?.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="px-3 py-3">{row.name}</td>
                            <td className="px-3 py-3">{row.journal_id?.[1] ?? "N/A"}</td>
                            <td className="px-3 py-3 capitalize">{row.state}</td>
                            <td className="px-3 py-3">
                              <Button size="sm" variant="outline" type="button" onClick={() => postEntryMutation.mutate(row.id)} disabled={postEntryMutation.isPending}>
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
          </>
        ) : null}
      </ConnectionGate>
    </div>
  );
}
