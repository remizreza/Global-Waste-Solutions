import { useEffect, useState } from 'react';
import { accounting } from '@/lib/odooClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RefreshCw, Eye, Send, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CreateInvoiceDialog } from './Invoices';

const PAYMENT_COLORS = { paid: 'default', in_payment: 'outline', partial: 'secondary', not_paid: 'destructive' };
const STATE_COLORS = { draft: 'secondary', posted: 'default', cancel: 'destructive' };

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await accounting.listBills();
    setBills(data);
    setLoading(false);
  }

  async function viewBill(bill) {
    const [detail] = await accounting.get(bill.id);
    const moveLines = await accounting.getLines(bill.id);
    setSelected(detail);
    setLines(moveLines);
  }

  async function post(id) { await accounting.post(id); toast.success('Bill posted!'); load(); }
  async function reset(id) { await accounting.reset(id); toast.success('Bill reset to draft.'); load(); }

  const filtered = bills.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.partner_id?.[1]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Bills</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />New Bill</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search bills..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{['Bill', 'Vendor', 'Date', 'Due', 'Amount', 'State', 'Payment', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.map(bill => (
                <tr key={bill.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{bill.name}</td>
                  <td className="px-4 py-3">{bill.partner_id?.[1]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{bill.invoice_date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{bill.invoice_date_due}</td>
                  <td className="px-4 py-3 font-medium">{bill.currency_id?.[1]} {(bill.amount_total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={STATE_COLORS[bill.state] || 'secondary'}>{bill.state}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={PAYMENT_COLORS[bill.payment_state] || 'secondary'}>{bill.payment_state?.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => viewBill(bill)}><Eye className="w-3.5 h-3.5" /></Button>
                      {bill.state === 'draft' && <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => post(bill.id)}><Send className="w-3.5 h-3.5" /></Button>}
                      {bill.state === 'posted' && bill.payment_state === 'not_paid' && <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-500" onClick={() => reset(bill.id)}><RotateCcw className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Vendor:</span> <strong>{selected.partner_id?.[1]}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> {selected.invoice_date}</div>
                <div><span className="text-muted-foreground">Total:</span> <strong>{(selected.amount_total || 0).toFixed(2)}</strong></div>
                <div><span className="text-muted-foreground">Residual:</span> {(selected.amount_residual || 0).toFixed(2)}</div>
              </div>
              <table className="w-full text-xs border rounded">
                <thead className="bg-muted/50"><tr>{['Account', 'Description', 'Debit', 'Credit'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
                <tbody>{lines.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 text-xs">{l.account_id?.[1]}</td>
                    <td className="px-3 py-2">{l.name}</td>
                    <td className="px-3 py-2">{l.debit > 0 ? l.debit.toFixed(2) : ''}</td>
                    <td className="px-3 py-2">{l.credit > 0 ? l.credit.toFixed(2) : ''}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showCreate && <CreateInvoiceDialog onClose={() => setShowCreate(false)} onCreated={load} type="in_invoice" title="New Vendor Bill" />}
    </div>
  );
}
