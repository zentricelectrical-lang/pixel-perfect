import { useState } from "react";
import { Download, Printer, Share2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FOOTER, type Biz, type DocModel } from "./model";

async function makePdf(doc: DocModel, biz: Biz) {
  const [{ pdf }, { DocPdf }] = await Promise.all([import("@react-pdf/renderer"), import("./DocPdf")]);
  return pdf(<DocPdf doc={doc} biz={biz} />).toBlob();
}

/** Download / print / share the real PDF built from the same model. */
export function DocActions({ doc, biz, phone }: { doc: DocModel; biz: Biz | null | undefined; phone?: string | null }) {
  const [busy, setBusy] = useState<string | null>(null);
  const file = `${doc.number}.pdf`;
  const run = (k: string, fn: (b: Blob) => Promise<void> | void) => async () => {
    if (!biz) return toast.error("Business details are still loading.");
    setBusy(k);
    try { await fn(await makePdf(doc, biz)); } catch (e) { if ((e as Error)?.name !== "AbortError") toast.error("The PDF could not be created. Please try again."); } finally { setBusy(null); }
  };
  const download = (b: Blob) => { const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = file; a.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); };
  return <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="gold" disabled={!!busy} onClick={run("dl", download)}><Download />{busy === "dl" ? "Preparing…" : "Download PDF"}</Button>
    <Button size="sm" variant="outline" disabled={!!busy} onClick={run("pr", (b) => { const w = window.open(URL.createObjectURL(b)); if (!w) download(b); })}><Printer />Print</Button>
    <Button size="sm" variant="whatsapp" disabled={!!busy} onClick={run("sh", async (b) => {
      const f = new File([b], file, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: `${doc.title} ${doc.number}`, text: `${doc.title} ${doc.number} from ${biz?.company_name}` }); return; }
      download(b);
      const digits = (phone ?? "").replace(/\D/g, "").replace(/^0/, "254");
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(`Hello, please find attached ${doc.title} ${doc.number} from ${biz?.company_name}.`)}`, "_blank");
      toast.info("PDF downloaded — attach it in the WhatsApp chat that just opened.");
    })}><Share2 />Share</Button>
  </div>;
}

/** Screen preview, laid out like the A4 PDF. */
export function DocView({ doc, biz }: { doc: DocModel; biz: Biz | null | undefined }) {
  const num = new Set(doc.table?.numeric ?? []);
  return <article className="relative overflow-hidden rounded-lg border border-border bg-card text-sm">
    {doc.demo ? <div className="bg-destructive/20 py-1 text-center text-xs font-bold tracking-widest text-destructive">DEMO DATA</div> : null}
    <header className="site-dark flex flex-wrap items-start justify-between gap-3 bg-background px-5 py-4">
      <div className="flex items-center gap-2"><Zap className="h-7 w-7 fill-gold text-gold" /><div><p className="font-display text-lg font-bold uppercase leading-none">{biz?.company_name}</p><p className="text-xs text-gold">{biz?.tagline}</p></div></div>
      <p className="whitespace-pre-line text-right text-xs text-muted-foreground">{[biz?.phone, biz?.email, biz?.address].filter(Boolean).join("\n")}</p>
    </header>
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-primary pb-2">
        <div><h2 className="font-display text-xl font-bold uppercase">{doc.title}</h2><p className="font-semibold">{doc.number}</p></div>
        <div className="text-right text-xs text-muted-foreground">{[["Date", doc.date], ...doc.meta, ...(doc.status ? [["Status", doc.status]] : [])].map(([k, v]) => <p key={k}>{k}: {v}</p>)}</div>
      </div>
      {doc.parties.length ? <div className="grid gap-3 sm:grid-cols-2">{doc.parties.map((p) => <div key={p.label} className="rounded border border-border p-3"><p className="mb-1 text-[11px] font-bold uppercase text-muted-foreground">{p.label}</p>{p.lines.filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}</div>)}</div> : null}
      {doc.table && doc.table.rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left"><thead className="bg-secondary text-xs">{<tr>{doc.table.head.map((h, i) => <th key={i} className={`p-2 ${num.has(i) ? "text-right" : ""}`}>{h}</th>)}</tr>}</thead><tbody>{doc.table.rows.map((r, ri) => <tr key={ri} className="border-b border-border">{r.map((c, i) => <td key={i} className={`p-2 ${num.has(i) ? "text-right" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div> : null}
      {doc.totals?.length ? <div className="ml-auto w-full max-w-xs space-y-1">{doc.totals.map(([k, v, b]) => <div key={k} className={`flex justify-between ${b ? "border-t border-foreground pt-1.5 font-bold" : ""}`}><span>{k}</span><span>{v}</span></div>)}</div> : null}
      {doc.sections.filter((x) => x.body?.trim()).map((x) => <div key={x.heading}><h3 className="font-semibold text-primary">{x.heading}</h3><p className="whitespace-pre-line text-muted-foreground">{x.body}</p></div>)}
      {doc.signatures?.length ? <div className="grid gap-4 pt-2 sm:grid-cols-2">{doc.signatures.map((g) => <div key={g.label}>{g.image ? <img src={g.image} alt={`${g.label} signature`} className="h-12 rounded bg-white object-contain" /> : <div className="h-12" />}<div className="border-t border-foreground pt-1 text-xs"><p className="font-semibold">{g.label}</p><p>{g.name}</p><p className="text-muted-foreground">Date: {g.date}</p></div></div>)}</div> : null}
      <p className="border-t border-border pt-2 text-center text-xs text-muted-foreground">{FOOTER}</p>
    </div>
  </article>;
}
