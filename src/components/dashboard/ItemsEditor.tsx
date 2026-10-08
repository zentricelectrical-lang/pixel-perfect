import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "./DashboardShell";
import { fail } from "@/lib/zec";

type Item = { id: string; description: string; quantity: number; unit: string | null; unit_price: number; sort_order: number; item_type?: string };

/** Line items for quotes or invoices. Saves straight to the database; totals are recalculated there. */
export function ItemsEditor({ table, parentKey, parentId, items, locked, onChange, withType }: { table: "quote_items" | "invoice_items"; parentKey: "quote_id" | "invoice_id"; parentId: string; items: Item[]; locked: boolean; onChange: () => void; withType?: boolean }) {
  const [n, setN] = useState({ description: "", quantity: "1", unit: "pcs", unit_price: "", item_type: "material" });
  const [busy, setBusy] = useState(false);
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const quantity = Number(n.quantity), unit_price = Number(n.unit_price);
    if (!n.description.trim() || !(quantity > 0) || !(unit_price >= 0) || n.unit_price === "") return fail({ message: "Enter a description, a quantity above zero and a price." });
    setBusy(true);
    const row = { [parentKey]: parentId, description: n.description.trim(), quantity, unit: n.unit || null, unit_price, sort_order: sorted.length, ...(withType ? { item_type: n.item_type } : {}) };
    const r = await supabase.from(table).insert(row as never);
    setBusy(false);
    if (r.error) return fail(r.error);
    setN({ ...n, description: "", unit_price: "", quantity: "1" });
    onChange();
  }
  async function remove(id: string) { const r = await supabase.from(table).delete().eq("id", id); if (r.error) return fail(r.error); onChange(); }
  return <div className="space-y-3">
    {sorted.length ? <ul className="divide-y divide-border rounded-md border border-border">{sorted.map((i) => <li key={i.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="font-medium">{i.description}{withType && i.item_type ? <span className="ml-2 text-xs text-muted-foreground">({i.item_type})</span> : null}</p><p className="text-muted-foreground">{Number(i.quantity)} {i.unit ?? ""} × {money(i.unit_price)}</p></div><div className="flex items-center gap-2"><strong className="whitespace-nowrap">{money(Number(i.quantity) * Number(i.unit_price))}</strong>{!locked ? <Button size="icon" variant="ghost" aria-label="Remove item" onClick={() => void remove(i.id)}><Trash2 className="h-4 w-4" /></Button> : null}</div></li>)}</ul> : <p className="text-sm text-muted-foreground">No line items yet.</p>}
    {!locked ? <form onSubmit={add} className="grid grid-cols-2 gap-2 rounded-md border border-dashed border-border p-3 sm:grid-cols-6">
      <Input className="col-span-2 sm:col-span-6" placeholder="Item description, e.g. 2.5mm twin & earth cable" value={n.description} onChange={(e) => setN({ ...n, description: e.target.value })} />
      <Input type="number" inputMode="decimal" min="0" step="any" placeholder="Qty" value={n.quantity} onChange={(e) => setN({ ...n, quantity: e.target.value })} />
      <Input placeholder="Unit" value={n.unit} onChange={(e) => setN({ ...n, unit: e.target.value })} />
      <Input type="number" inputMode="decimal" min="0" step="any" placeholder="Unit price" value={n.unit_price} onChange={(e) => setN({ ...n, unit_price: e.target.value })} className="col-span-2 sm:col-span-2" />
      {withType ? <Select value={n.item_type} onValueChange={(v) => setN({ ...n, item_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="material">Material</SelectItem><SelectItem value="labour">Labour</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select> : null}
      <Button type="submit" variant="outline" disabled={busy} className={withType ? "" : "col-span-2 sm:col-span-2"}><Plus />Add</Button>
    </form> : null}
  </div>;
}
